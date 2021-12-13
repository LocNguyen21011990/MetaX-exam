import { User } from "../entities/User";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware, FieldResolver, Root } from "type-graphql";
import argon2 from 'argon2';
import { UserMutationResponse } from "../types/UserMuationRepsonse";
import { RegisterInput } from "../types/RegisterInput";
import { validatePasswordInput, validateConfirmPasswordInput } from "../utils/validatePasswordInput";
import { LoginInput } from "../types/LoginInput";
import { Context } from "../types/Context";
import { COOKIE_NAME, __prod__ } from "../constants";
import { checkAuth } from "../middleware/checkAuth";
import { TokenModel } from "../models/Token";
import { v4 as uuidv4 } from 'uuid'
import { sendEmail } from "../utils/sendEmail";
import nodemailer from 'nodemailer'
import { SendMailMutationResponse } from "../types/SendMailMutationResponse";
import { ForgotPasswordInput } from "../types/ForgotPassword";
import { ChangePasswordInput } from "../types/ChangePasswordInput";
import { ResetNameInput } from "../types/ResetNameInput";
import { OauthInput } from "../types/OauthInput";
import { OauthAccount } from "../entities/OauthAccount";

@Resolver(_of => User)
export class UserResolver {
    @FieldResolver(_return => String)
	email(@Root() user: User, @Ctx() { req }: Context) {
		return req.session.userId === user.id ? user.email : ''
	}

	@Query(_return => User, { nullable: true })
	async me(@Ctx() { req }: Context): Promise<User | undefined | null> {
		if (!req.session.userId) return null
		const user = await User.findOne(req.session.userId)
		return user
	}

    @Mutation(_returns => UserMutationResponse)
    async register(
        @Arg('registerInput') registerInput: RegisterInput,
        @Ctx() { req }: Context
    ) : Promise<UserMutationResponse> {

        const validatePassword = validatePasswordInput(registerInput.password);
        if(validatePassword) {
            return {
                ...validatePassword
            }
        }

        try {
            const { email, password } = registerInput;
            const existingEmail = await User.findOne({ email });
            if(existingEmail) return {
                code: 400,
                success: false,
                message: 'Duplicated email',
                errors: [
                    {
                        field: 'email',
                        message: `Email already taken`
                    }
                ]
            };

            const hashedPassword = await argon2.hash(password);
            const newUser = await User.create({ 
                email, 
                password: hashedPassword
            });

            const createdUser = await User.save(newUser);

            req.session.userId = createdUser.id;

            return {
                code: 200,
                success: true,
                message: 'User registration successfully',
                user: createdUser
            };
        } catch (error) {
            console.log(error);
            return {
                code: 500,
                success: false,
                message: `Internal server error`,
                errors: [{
                    field: '',
                    message: error.message
                }]
            };
        }
    }

    @Mutation(_returns => UserMutationResponse)
    async login(
        @Arg('loginInput') { email, password }: LoginInput,
        @Ctx() { req }: Context
    ) : Promise<UserMutationResponse> {
        try {

            const existingUser = await User.findOne({ email });
            if(!existingUser) {
                return {
                    code: 404,
                    success: false,
                    message: 'User not found',
                    errors: [{ 
                        field: 'email',
                        message: 'Email incorrect. Please register account'
                    }]
                };
            }

            const passwordValid = await argon2.verify(existingUser.password, password);
            if(!passwordValid) {
                return { 
                    code: 401,
                    success: false,
                    message: 'Wrong password',
                    errors: [
                        {
                            field: 'password',
                            message: 'Wrong password. Please try again'
                        }
                    ]
                }
            }

            
            if(!existingUser.isVerified) {
                return {
                    code: 403,
                    success: false,
                    message: "Email not verified",
                    user: existingUser,
                    errors: [{ 
                        field: 'email',
                        message: 'Email not verified. Please verify your email'
                    }]
                };
            }

            // Request Session and return Cookie
            req.session.userId = existingUser.id
            

            return {
                code: 200,
                success: true,
                message: 'Logged in successfully',
                user: existingUser
            };
        } catch (error) {
            console.log(error);
            return {
                code: 500,
                success: false,
                message: `Internal server error`,
                errors: [{
                    field: '',
                    message: error.message
                }]
            };
        }
    }

    @Mutation(_returns => Boolean)
    async logout(@Ctx() { req, res }: Context): Promise<boolean> {
        return new Promise<boolean>((resolve, _reject) => {
            res.clearCookie(COOKIE_NAME);
            req.session.destroy(error => {
                if(error) {
                    console.log('Destroy session error', error);
                    resolve(false);
                }
                resolve(true);
            });
        })
    }

    @Mutation(_returns => UserMutationResponse)
    async verifyEmail(
        @Arg('token') token: string,
		@Arg('userId') userId: string,
		@Ctx() { req }: Context
    ): Promise<UserMutationResponse> {
        try {
            const verifyingUser = await User.findOne(userId);

            const verifyTokenRecord = await TokenModel.findOne({ userId });
			if (!verifyTokenRecord) {
				return {
					code: 401,
					success: false,
					message: 'Invalid or expired verify token'
				}
			}

			const verifyTokenValid = argon2.verify(
				verifyTokenRecord.token,
				token
			);

			if (!verifyTokenValid) {
				return {
					code: 401,
					success: false,
					message: 'Invalid or expired verify token'
				}
			}

			if (!verifyingUser) {
				return {
					code: 404,
					success: false,
					message: 'User no longer exists'
				}
			}

			verifyingUser.isVerified = true;
            verifyingUser.save();

			await verifyTokenRecord.deleteOne();

			req.session.userId = verifyingUser.id;

			return {
				code: 200,
				success: true,
				message: 'Email verified successfully',
				user: verifyingUser
			}

        } catch (error) {
            console.log(error);
            return {
                code: 500,
                success: false,
                message: `Internal server error`,
                errors: [{
                    field: '',
                    message: error.message
                }]
            };
        }
    }

    @Mutation(_return => SendMailMutationResponse)
	async sendVerifyEmail(
		@Arg('userId') userId: string,
		@Arg('email') email: string
	): Promise<SendMailMutationResponse> {
		try {
            const verifyingUser = await User.findOne(userId);

			if (!verifyingUser) {
				return {
					code: 400,
					success: false,
					message: 'User no longer exists'
				}
			}

            const newToken = uuidv4()
            const hashedToken = await argon2.hash(newToken)

            // save token to db
            await new TokenModel({
                userId: userId,
                token: hashedToken
            }).save();

            const html = `
            <html>
            <p>Dear valued User,</p>

            <p>Please click <a href="${__prod__
                ? process.env.CORS_ORIGIN_PROD
                : process.env.CORS_ORIGIN_DEV}/verify-email?token=${newToken}&userId=${userId}">here</a> to verify your email. Then you can login to MetaX</p>

            <p>Kindly regards</p>
            `;

            const info = await sendEmail(
                email,
                html,
                "Verify your email for log in MetaX"
            )

			return {
                code: 200,
                success: true,
                message: `An verify email was sent to "${email}". <br>
                Please visit <a href="${nodemailer.getTestMessageUrl(info)}" style="color:#FF0000;">here</a> to verify your email.`
            }

		} catch (error) {
			console.log(error)
			return  {
                code: 500,
                success: false,
                message: `Internal server error ${error.message}`
            }
		}
    }

    @Query(_returns => User)
    @UseMiddleware(checkAuth)
    async getLoggedUser(@Ctx() { req }: Context): Promise<User | undefined | null>  {
        try {
			const loggedUser = await User.findOne({ id: req.session.userId });

			return loggedUser ?? null;
		} catch (error) {
			console.log(error);
            return null;
		}
    }


    @Mutation(_return => UserMutationResponse)
	async changePassword(
		@Arg('token') token: string,
		@Arg('userId') userId: string,
		@Arg('changePasswordInput') changePasswordInput: ChangePasswordInput,
		@Ctx() { req }: Context
	): Promise<UserMutationResponse> {
        const validateNewPass = validatePasswordInput(changePasswordInput.newPassword, 'newPassword');
		if (validateNewPass) {
			return {
				...validateNewPass
			}
		}

        const validateSamePass = validateConfirmPasswordInput(changePasswordInput.newPassword, changePasswordInput.confirmPassword);
		if (validateSamePass) {
			return {
				...validateSamePass
			}
		}

		try {
			const resetPasswordTokenRecord = await TokenModel.findOne({ userId })
			if (!resetPasswordTokenRecord) {
				return {
					code: 400,
					success: false,
					message: 'Invalid or expired password reset token',
					errors: [
						{
							field: 'token',
							message: 'Invalid or expired password reset token'
						}
					]
				}
			}

			const resetPasswordTokenValid = argon2.verify(
				resetPasswordTokenRecord.token,
				token
			)

			if (!resetPasswordTokenValid) {
				return {
					code: 400,
					success: false,
					message: 'Invalid or expired password reset token',
					errors: [
						{
							field: 'token',
							message: 'Invalid or expired password reset token'
						}
					]
				}
			}

			const user = await User.findOne(userId)

			if (!user) {
				return {
					code: 400,
					success: false,
					message: 'User no longer exists',
					errors: [{ field: 'token', message: 'User no longer exists' }]
				}
			}

            const oldPasswordValid = await argon2.verify(user.password, changePasswordInput.oldPassword);
            if(!oldPasswordValid) {
                return { 
                    code: 400,
                    success: false,
                    message: 'Wrong password',
                    errors: [
                        {
                            field: 'oldPassword',
                            message: 'Wrong password. Please try again'
                        }
                    ]
                }
            }

			const updatedPassword = await argon2.hash(changePasswordInput.newPassword)
			await User.update({ id: userId }, { password: updatedPassword })

			await resetPasswordTokenRecord.deleteOne()

			req.session.userId = user.id

			return {
				code: 200,
				success: true,
				message: 'User password reset successfully',
				user
			}
		} catch (error) {
			console.log(error)
			return {
				code: 500,
				success: false,
				message: `Internal server error`,
                errors: [{
                    field: '',
                    message: error.message
                }]
			}
		}
	}

    @Mutation(_return => SendMailMutationResponse)
	async forgotPassword(
		@Arg('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput
	): Promise<SendMailMutationResponse> {
		const user = await User.findOne({ email: forgotPasswordInput.email })

		if (!user) {
            return {
                code: 404,
                success: false,
                message: 'User no longer exists'
            }
        }

		await TokenModel.findOneAndDelete({ userId: `${user.id}` })

		const resetToken = uuidv4()
		const hashedResetToken = await argon2.hash(resetToken)

		await new TokenModel({
			userId: `${user.id}`,
			token: hashedResetToken
		}).save()

        const html = `
        <html>
        <p>Dear valued User,</p>

        <p><a href="${__prod__
            ? process.env.CORS_ORIGIN_PROD
            : process.env.CORS_ORIGIN_DEV}/change-password?token=${resetToken}&userId=${user.id}">Click here to reset your password</a></p>

        <p>Kindly regards</p>
        `;

        const info = await sendEmail(
            forgotPasswordInput.email,
            html,
            "Change yuor password"
        )

        return {
            code: 200,
            success: true,
            message: `An verify email was sent to "${forgotPasswordInput.email}". <br>
            Please visit <a href="${nodemailer.getTestMessageUrl(info)}" style="color:#FF0000;">here</a> to verify your email.`
        }
	}

    @Mutation(_returns => UserMutationResponse)
    @UseMiddleware(checkAuth)
    async resetName(
        @Arg('resetNameInput') resetNameInput: ResetNameInput,
        @Ctx() { req }: Context,
        ): Promise<UserMutationResponse> {
        try {
			const loggedUser = await User.findOne(req.session.userId);
            if(!loggedUser) {
                return {
                    code: 400,
                    success: false,
                    message: 'User not found',
                    errors: [
                        {
                            field: 'name',
                            message: 'User not found'
                        }
                    ]
                }
            }

            loggedUser.name = resetNameInput.name;

            const updatedUser = await loggedUser.save();

			return {
                code: 200,
                success: true,
                message: 'Changed name successfully',
                user: updatedUser
            };
		} catch (error) {
			console.log(error);
            return {
                code: 500,
                success: false,
                message: `Internal server error ${error.message}`
            };
		}
    }

    @Mutation(_returns => UserMutationResponse)
    async oAuth(
        @Arg('oauthInput') oauthInput: OauthInput,
        @Ctx() { req, connection }: Context
    ) : Promise<UserMutationResponse> {
        return await connection.transaction(async transactionEnityManager => {
            try {
                let user: User;
                const accountInfo = {
                    provider: oauthInput.provider,
                    providerAccountId: oauthInput.providerAccountId
                }

                const oauthAccount = await transactionEnityManager.findOne(OauthAccount, { 
                    ...accountInfo,
                    user: {
                        email: oauthInput.email
                    },
                }, {
                    relations: ['user']
                });

                if(!oauthAccount) {
                    const checkUser = await transactionEnityManager.findOne(User, {
                        email: oauthInput.email
                    });

                    if(checkUser) {
                        checkUser.name = oauthInput.name;
                        const updatedUser = await transactionEnityManager.save(User, checkUser);
                        user = updatedUser;
                    }
                    else {
                        const hashedPassword = await argon2.hash(uuidv4());
                        const newUser = await transactionEnityManager.create(User, {
                            email: oauthInput.email,
                            password: hashedPassword,
                            name: oauthInput.name
                        });
                        const createdUser = await transactionEnityManager.save(User, newUser);
                        user = createdUser;
                    }

                    const checkAccountAgain = await transactionEnityManager.findOne(OauthAccount, {...accountInfo});

                    if(!checkAccountAgain) {
                        const newOauthAccount = await transactionEnityManager.create(OauthAccount, {
                            ...accountInfo,
                            userId: user.id
                        });
                        newOauthAccount.user = user;
                        await transactionEnityManager.save(OauthAccount, newOauthAccount);
                    }
                    else {
                        checkAccountAgain.userId = user.id;
                        checkAccountAgain.user = user;
                        await transactionEnityManager.save(OauthAccount, checkAccountAgain);
                    }
                    
                }
                else {
                    user = oauthAccount.user;
                }

                req.session.userId = user.id;

                return { 
                    code: 200,
                    success: true,
                    message: `Authenticated with ${oauthInput.provider}`,
                    user: user
                }
            } catch (error) {
                console.log(error);
                return { 
                    code: 500,
                    success: false,
                    message: `Unauthenticated with error: ${error.message}`
                }
            }
        })

    }
}