import nodemailer from 'nodemailer'

// async..await is not allowed in global scope, must use a wrapper
export const sendEmail = async (to: string, html: string, subject: string) => {
	// Generate test SMTP service account from ethereal.email

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: 'qknuetkp64wo6kq5@ethereal.email', // generated ethereal user
			pass: 'w1N1nRKTa58ZzggbSS' // generated ethereal password
		},
		tls: {
			rejectUnauthorized: false // avoid NodeJs self signed certificate error
		}
	})

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"MetaX Authorization:" <support@metax.com>', // sender address
		to, // list of receivers,
		cc: "admin@metax.com", //cc to admin
		subject: subject, // Subject line
		html // html body
	})

	return info;
}