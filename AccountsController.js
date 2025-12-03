import AccountsService from './AccountsService.js';

class AccountsController {
    async login(req, res) {
        try {
            res.render('login', { title: "Login Page" });
        } catch (e) {
            res.json(e.message);
        }
    }

    async loginValidate(req, res) {
        try {
            const user = await AccountsService.validate(req.body);
            if (user) {
                req.session.isAdmin = user.isAdmin === 'true'; // Ensure boolean value
                console.log('User isAdmin:', req.session.isAdmin);
                res.redirect('/api/collections');
            } else {
                res.render('login', { title: "Can't find account" });
            }
        } catch (e) {
            res.json(e.message);
        }
    }

    async register(req, res) {
        try {
            res.render('register', { title: "Register Page" });
        } catch (e) {
            res.json(e.message);
        }
    }

    async createAccount(req, res) {
        try {
            await AccountsService.createAccount(req.body.login, req.body.password, req.body.isAdmin === 'true');
            return res.redirect('/api/login');
        } catch (e) {
            res.json("Create account error: " + e.message);
        }
    }
}

export default new AccountsController();
