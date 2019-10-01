import { Controller, Get, Inject, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ZBClient } from 'zeebe-node';
import {
    CreateWorkflowInstanceResponse,
    CompleteFn,
    Job,
} from 'zeebe-node/interfaces';
import { ZEEBE_CONNECTION_PROVIDER, ZeebeWorker } from '@payk/nestjs-zeebe';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from '@payk/nestjs-winston';

export interface EmailJobData {
    email?: string;
    firstName?: string;
    lastName?: string;
}

interface Headers {
    'email:template': string;
}

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject(ZEEBE_CONNECTION_PROVIDER) private readonly zbClient: ZBClient,
    ) {
        this.zbClient.deployWorkflow('./bpmn/email.test.bpmn');
    }

    // Use the client to create a new workflow instance
    @Get(':email/:firstName/:lastName')
    getHello(@Param() param): Promise<CreateWorkflowInstanceResponse> {
        const { email, firstName, lastName } = param;
        this.logger.info({ email, firstName, lastName });
        return this.zbClient.createWorkflowInstance('email.test', {
            email,
            firstName,
            lastName,
        });
    }

    // Subscribe to events of type 'email:send'
    @ZeebeWorker('email:send', {
        fetchVariable: ['email', 'firstName', 'lastName'],
    })
    async emailService(job: Job<EmailJobData, Headers>, complete) {
        this.logger.info('Email service');
        const template = job.customHeaders['email:template'];
        try {
            await this.appService.sendEmail(template, job.variables);
        } catch (e) {
            this.logger.error(e.message);
            return complete.failure(e.message);
        }
        complete.success();
    }
}
