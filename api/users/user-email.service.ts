import {DEFAULT_REQUEST_DETAILS} from '../../koa.config';

import {EmailService} from '../shared/email.service';
import {Logger} from '../shared/logger.service';


class UserEmailService {
    async sendForgotPassword(user, code, details = DEFAULT_REQUEST_DETAILS) {
        let templateId = EmailService.getEmailTemplateId('createForgotPassword');
        let firstName = user.firstName;
        let res = EmailService.sendEmail(user, {code, firstName}, 'Reset password instructions', templateId, details);
        Logger.log('info', '[Users] [Email Service] [Forgot Pass Email] Reset password email sent successfully', {user, details});
        return res;
    }

    async sendPasswordChanged(user, details = DEFAULT_REQUEST_DETAILS) {
        let templateId = EmailService.getEmailTemplateId('passwordChanged');
        let firstName = user.firstName;
        let res = EmailService.sendEmail(user, {firstName}, 'Password changed', templateId, details);
        Logger.log('info', '[Users] [Email Service] [Password Changed Email] Password changed email sent successfully', {user, details});
        return res;
    }

    async sendSignUpSuccessful(user, details = DEFAULT_REQUEST_DETAILS) {
        let templateId = EmailService.getEmailTemplateId('signupSuccessful');
        let firstName = user.firstName;
        let res = await EmailService.sendEmail(user, {firstName}, 'Welcome!', templateId, details);
        Logger.log('info', '[Users] [Email Service] [SignUp Email] Sign up email sent successfully', {user, details});
        return res;
    }
}

const singleton = new UserEmailService();

export {singleton as UserEmailService};