const express = require('express');
const router = express.Router();

//---------User model----------//
const User = require('../models/User')

//---------Login Page----------//
router.get('/login', (req, res) => res.render('login'));

//---------Register Page----------//
router.get('/register', (req, res) => res.render('register'));

//---------Register Handle----------//
router.post('/register', (req, res) => {
    const { name, email } = req.body;

    //---------Checking for errors----------//
    let errors = [];

    if (!name || !email) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email
        });
    } else {
        //---------Validation Passed----------//
        User.findOne({ email: email, isActive: true }) // Modify the query condition
            .then(user => {
                if (user) {
                    // User already exists
                    errors.push({ msg: 'Email ID already exists' });
                    res.render('register', {
                        errors,
                        name,
                        email
                    });
                } else {
                    const newUser = new User({
                        name,
                        email
                    });

                    // Save the user
                    newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));

    }
});

//---------Login Handle----------//
router.post('/login', (req, res) => {
    const { name, email } = req.body;

    // Checking user in database
    User.findOne({ email: email })
        .exec()
        .then(user => {
            if (!user) {
                let errors = [];
                errors.push({ msg: 'This email is not registered' });
                res.render('login', {
                    errors,
                    name,
                    email
                });
            } else {
                res.redirect(`/dashboard?user=${user.email}`);
            }
        })
        .catch(err => {
            console.log(err);
            // Handle the error appropriately
            res.status(500).send('Internal Server Error');
        });
});


//---------Logout Handle----------//
router.get('/logout', (req, res) => {
    // req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;