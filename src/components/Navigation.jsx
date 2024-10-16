import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { ExploreOutlined, DashboardOutlined, HomeOutlined, Menu as MenuIcon, Login, PersonAdd } from '@mui/icons-material';

const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate("/signin");
    }).catch((error) => {
      console.error('Sign out error', error);
    });
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <List>
        <ListItem button component={RouterLink} to="/" onClick={handleDrawerToggle}>
          <ListItemIcon><HomeOutlined /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        {user ? (
          <ListItem button component={RouterLink} to="/dashboard" onClick={handleDrawerToggle}>
          <ListItemIcon><ExploreOutlined /></ListItemIcon>
          <ListItemText primary="Explore" />
        </ListItem>
        ) : (
          <>
            <ListItem button component={RouterLink} to="/signin" onClick={handleDrawerToggle}>
              <ListItemIcon><Login /></ListItemIcon>
              <ListItemText primary="Sign In" />
            </ListItem>
            <ListItem button component={RouterLink} to="/signup" onClick={handleDrawerToggle}>
              <ListItemIcon><PersonAdd /></ListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          EventBooker
        </Typography>
        {!isMobile && (
          <>
            <Button color="inherit" component={RouterLink} to="/" startIcon={<HomeOutlined />}>
              Home
            </Button>
            <Button color="inherit" component={RouterLink} to="/explore" startIcon={<ExploreOutlined />}>
              Explore
            </Button>
            {user ? (
              <Button color="inherit" component={RouterLink} to="/dashboard" startIcon={<DashboardOutlined />}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/signin">
                  Sign In
                </Button>
                <Button color="inherit" component={RouterLink} to="/signup">
                  Sign Up
                </Button>
              </>
            )}
          </>
        )}
        {user && (
          <>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                alt={user.displayName || 'User'} 
                src={user.photoURL || '/placeholder.svg?height=40&width=40&text=User'}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <Typography>{user.displayName || user.email}</Typography>
              </MenuItem>
              <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>My Profile</MenuItem>
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navigation;