import React from 'react'
import { Menu, MenuButton, MenuList, Button, MenuItem } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import {
	MeDocument,
	MeQuery,
	useLogoutMutation
} from '../generated/graphql'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

const MainMenu = props => {
    const user = props.dataMe;
    const [logout, _] = useLogoutMutation()
    const router = useRouter();

	const logoutUser = async () => {
		await logout({
			update(cache, { data }) {
				if (data?.logout) {
					signOut({redirect: false}).then(() => {
						cache.writeQuery<MeQuery>({
							query: MeDocument,
							data: { me: null }
						})
					});
				}
			}
		})
	}

    const changePassword = () => {
        router.push({pathname: '/forgot-password', query: { isChangePassword: "1" }});
    }

    return (
        <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Welcome, {user.name ?? 'User'}
            </MenuButton>
            <MenuList>
                <MenuItem onClick={changePassword}>
                    Change Password
                </MenuItem>
                <MenuItem onClick={logoutUser}>Logout</MenuItem>
            </MenuList>
        </Menu>
    )
}

export default MainMenu
