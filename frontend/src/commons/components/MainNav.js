import React from 'react';

import {Navbar, Form, FormControl, Nav} from 'react-bootstrap';

import { useDispatch } from "react-redux";


import { logout } from "../../actions/auth";


import photo from '../../images/ubeats.png'


function MainNav(props) { 
    const dispatch = useDispatch();

    const logOut = () => {
        dispatch(logout());
      };

    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="/">
            <img
                src={photo}
                height="30"
                className="d-inline-block align-top"
                alt="UBEATS"
            />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Form inline >
                <FormControl type="text" placeholder="Enter delivery address" className="mr-sm-2" />
                </Form>
                {props.isLogged ? 
                (<Nav className="mr-auto"> 
                    <Nav.Link onClick={logOut}>Log out</Nav.Link>
                </Nav>
                
                ) : 
                (<Nav className="mr-auto"> 
                    <Nav.Link href='/login'>Log in</Nav.Link>
                 </Nav>
                ) }      

            </Navbar.Collapse>
        </Navbar>
    );
    
}

export default MainNav;