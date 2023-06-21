import { HamburgerIcon } from "@chakra-ui/icons";
import {
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
} from "@chakra-ui/react";

export default function Options() {
    return (
        <Menu>
            <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<HamburgerIcon />}
                variant={"solid"}
            />
            <MenuList>
                <MenuItem>Contacts</MenuItem>
                <MenuItem>Dark Mode</MenuItem>
                <MenuItem>Logout</MenuItem>
            </MenuList>
        </Menu>
    );
}
