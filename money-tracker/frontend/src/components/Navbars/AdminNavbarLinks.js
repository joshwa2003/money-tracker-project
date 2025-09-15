// Chakra Icons
import { BellIcon } from "@chakra-ui/icons";
// Chakra Imports
import {
  Avatar,
  Box, Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList, Stack, Text, useColorMode,
  useColorModeValue
} from "@chakra-ui/react";
// Assets
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
// Custom Icons
import { ProfileIcon, SettingsIcon } from "components/Icons/Icons";
// Custom Components
import { ItemContent } from "components/Menu/ItemContent";
import { SearchBar } from "components/Navbars/SearchBar/SearchBar";
import { SidebarResponsive } from "components/Sidebar/Sidebar";
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import routes from "routes.js";
import { isAuthenticated, getUser, setAuthToken, setUser } from "services/api.js";

export default function HeaderLinks(props) {
  const {
    variant,
    children,
    fixed,
    scrolled,
    secondary,
    onOpen,
    ...rest
  } = props;

  const { colorMode } = useColorMode();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        const user = getUser();
        setCurrentUser(user);
      }
    };

    checkAuthStatus();
    // Listen for storage changes to update auth status
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  // Chakra Color Mode
  let navbarIcon =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");
  let menuBg = useColorModeValue("white", "navy.800");
  if (secondary) {
    navbarIcon = "white";
  }
  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems='center'
      flexDirection='row'>
      <SearchBar me='18px' />
      {isLoggedIn && currentUser ? (
        <Menu>
          <MenuButton me={{ sm: "2px", md: "16px" }}>
            <Flex alignItems="center" cursor="pointer">
              <Avatar
                size="sm"
                name={currentUser.name || currentUser.email}
                src={currentUser.profilePicture || currentUser.avatar}
                me="8px"
              />
              <Text
                display={{ sm: "none", md: "flex" }}
                color={navbarIcon}
                fontSize="sm"
                fontWeight="medium"
              >
                {currentUser.name || currentUser.email}
              </Text>
            </Flex>
          </MenuButton>
          <MenuList bg={menuBg} p="8px">
            <MenuItem borderRadius="8px" mb="4px">
              <NavLink to="/admin/profile" style={{ width: "100%" }}>
                <Flex alignItems="center">
                  <ProfileIcon color={useColorModeValue("gray.700", "white")} w="16px" h="16px" me="8px" />
                  <Text fontSize="sm">Profile</Text>
                </Flex>
              </NavLink>
            </MenuItem>
            <MenuItem 
              borderRadius="8px" 
              onClick={() => {
                // Clear all authentication data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setAuthToken(null);
                setUser(null);
                setIsLoggedIn(false);
                setCurrentUser(null);
                // Force redirect to login page
                window.location.href = '#/auth/signin';
              }}
            >
              <Flex alignItems="center">
                <Box w="16px" h="16px" me="8px">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                </Box>
                <Text fontSize="sm">Logout</Text>
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <NavLink to='/auth/signin'>
          <Button
            ms='0px'
            px='0px'
            me={{ sm: "2px", md: "16px" }}
            color={navbarIcon}
            variant='no-effects'
            rightIcon={
              document.documentElement.dir ? (
                ""
              ) : (
                <ProfileIcon color={navbarIcon} w='22px' h='22px' me='0px' />
              )
            }
            leftIcon={
              document.documentElement.dir ? (
                <ProfileIcon color={navbarIcon} w='22px' h='22px' me='0px' />
              ) : (
                ""
              )
            }>
            <Text display={{ sm: "none", md: "flex" }}>Sign In</Text>
          </Button>
        </NavLink>
      )}
      <SidebarResponsive
        hamburgerColor={"white"}
        logo={
          <Text
            fontSize='24px'
            fontWeight='bold'
            color={colorMode === "dark" ? "white" : "gray.700"}
            textAlign='center'
          >
            Waste App
          </Text>
        }
        colorMode={colorMode}
        secondary={props.secondary}
        routes={routes}
        {...rest}
      />
      <SettingsIcon
        cursor='pointer'
        ms={{ base: "16px", xl: "0px" }}
        me='16px'
        onClick={props.onOpen}
        color={navbarIcon}
        w='18px'
        h='18px'
      />
      <Menu>
        <MenuButton>
          <BellIcon color={navbarIcon} w='18px' h='18px' />
        </MenuButton>
        <MenuList p='16px 8px' bg={menuBg}>
          <Flex flexDirection='column'>
            <MenuItem borderRadius='8px' mb='10px'>
              <ItemContent
                time='13 minutes ago'
                info='from Alicia'
                boldInfo='New Message'
                aName='Alicia'
                aSrc={avatar1}
              />
            </MenuItem>
            <MenuItem borderRadius='8px' mb='10px'>
              <ItemContent
                time='2 days ago'
                info='by Josh Henry'
                boldInfo='New Album'
                aName='Josh Henry'
                aSrc={avatar2}
              />
            </MenuItem>
            <MenuItem borderRadius='8px'>
              <ItemContent
                time='3 days ago'
                info='Payment succesfully completed!'
                boldInfo=''
                aName='Kara'
                aSrc={avatar3}
              />
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}