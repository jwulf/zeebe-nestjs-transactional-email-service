export const templates = {
    welcome: {
        subject: 'Welcome!',
        body: {
            name: '{{firstName}} {{lastName}}',
            intro: `Welcome to {{product}}! We're very excited to have you on board.`,
            action: {
                instructions:
                    'To get started with {{product}}, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Confirm your account',
                    link: '{{baseUrl}}/confirm?s={{email}}',
                },
            },
            outro: `Need help, or have questions? Just reply to this email, we'd love to help.`,
        },
    },
};
