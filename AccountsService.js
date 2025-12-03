import Account from './AccountsScheme.js'

class AccountsService{
    async createAccount(login,password,isAdmin){
        const newAccount = await Account.create({login,password,isAdmin})
        return newAccount
    }
    async validate(account){
        console.log(account)
        if(!account){
            throw new Error ('Login or password wrong')
        }
        const post = await Account.findOne(account)
        return post
    }
}

export default new AccountsService()