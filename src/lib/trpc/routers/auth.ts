export const authRouter = {
    login: async () => ({ success: true, token: 'jwt_token' }),
    logout: async () => ({ success: true }),
    refresh: async () => ({ token: 'new_token' }),
};
export default authRouter;
