export const resetPasswordContext = resetUrl => `
    <h1>Here is your reset password link</h1>
    <a href=${resetUrl} style={textDecoration: "none"}>reset your password</a>
    <p>link is active for 15 minutes</p>
`;
