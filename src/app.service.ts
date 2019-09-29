import { Injectable, Inject } from '@nestjs/common';
import { EmailJobData } from './app.controller';
import ses = require('node-ses');
import { WINSTON_MODULE_PROVIDER } from '@payk/nestjs-winston';
import { Logger } from 'winston';
import * as EmailValidator from 'email-validator';
import Mailgen = require('mailgen');
import { templates } from './templates';
// tslint:disable-next-line: no-var-requires
const { render } = require('micromustache');

const key = process.env.ZEEBE_TXES_AWS_SES_KEY;
const secret = process.env.ZEEBE_TXES_AWS_SES_SECRET;
const defaultProductName = process.env.ZEEBE_TXES_PRODUCT_NAME || 'MegaCorp';
const defaultProductLink =
    process.env.ZEEBE_TXES_PRODUCT_LINK || 'https://megacorp.io';
const defaultFrom = process.env.ZEEBE_TXES_FROM_EMAIL || 'info@megacorp.io';
const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: defaultProductName,
        link: defaultProductLink,
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    },
});

@Injectable()
export class AppService {
    client: ses.Client;
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {
        // Maybe throw if creds don't exist
        if (!key || !secret) {
            this.logger.error('Missing required AWS SES credential(s)');
        }
        this.client = ses.createClient({ key, secret });
    }

    async sendEmail(templateName: string, data: EmailJobData) {
        const { email, firstName, lastName } = data;

        this.logger.info({
            email,
            firstName,
            lastName,
            template: templateName,
        });
        // Validate email?? - throw if not valid!
        if (!EmailValidator.validate(email)) {
            this.logger.error(`Email address ${email} does not validate`);
            throw new Error(`Email address ${email} does not validate`);
        }

        const template = templates[templateName];

        if (!template) {
            this.logger.error(`Template ${templateName} not found!`);
            throw new Error(`Template ${templateName} not found!`);
        }

        // Generate an HTML email with the provided contents
        const emailBody = mailGenerator.generate(template);
        // Generate the plaintext version of the e-mail (for clients that do not support HTML)
        const emailText = mailGenerator.generatePlaintext(template);
        // Apply variables to template - throw if error!

        const message = render(emailBody, {
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            product: defaultProductName,
            baseUrl: defaultProductLink,
        });

        const altText = render(emailText, {
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            product: defaultProductName,
            baseUrl: defaultProductLink,
        });

        // Send email - throw if error!
        await new Promise((resolve, reject) =>
            this.client.sendEmail(
                {
                    to: email,
                    from: defaultFrom,
                    subject: template.subject,
                    message,
                    altText,
                },
                (err, _, __) => {
                    if (err) {
                        this.logger.error(err.Message);
                        return reject(err.Message);
                    }
                    this.logger.info(`Email sent to ${email}`);
                    resolve();
                },
            ),
        );
        return true;
    }
}
