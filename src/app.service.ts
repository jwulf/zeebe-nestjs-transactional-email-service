import { Injectable } from '@nestjs/common';
import { EmailJobData } from './app.controller';
import ses = require('node-ses');

const key = process.env.AWS_SES_KEY;
const secret = process.env.AWS_SES_SECRET;

@Injectable()
export class AppService {
    client: ses.Client;
    constructor() {
        // Maybe throw if creds don't exist
        this.client = ses.createClient({ key, secret });
    }
    getHello(): string {
        return 'Hello World!';
    }

    sendEmail(template: string, data: EmailJobData) {
        // Validate email?? - throw if not valid!
        // Provide defaults for missing data or throw/return error?
        // Load template - throw error if not found!

        // Apply variables to template - throw if error!
        // Send email - throw if error!
        return true;
    }
}
