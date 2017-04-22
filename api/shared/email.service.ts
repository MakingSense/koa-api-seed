import * as _ from "lodash";
import config from "../../configs/config";
import {Logger} from "./logger.service";
import {Toggle} from "./toggles.service";
import * as sendgrid from "sendgrid";
import {DEFAULT_REQUEST_DETAILS} from "../../koa.config";
import template = require("lodash/template");

let helper = sendgrid.mail;
let {Email, Content, Mail, Substitution, Personalization} = helper;

interface StringMap { [s: string]: string;
}

class EmailService {
    private sg;

    constructor(apiKey) {
        this.sg = sendgrid(apiKey);
    }

    @Toggle("emails")
    async sendEmail(user, data: StringMap = {}, subject = "", templateId, details = DEFAULT_REQUEST_DETAILS) {
        let from = new Email(config.emails.from);
        let to = new Email(user.email);
        let personalization = new Personalization();
        let mail = new Mail();

        mail.setFrom(from);
        mail.setSubject(subject);
        mail.setTemplateId(templateId);

        //create personalization
        personalization.addTo(to);
        _.forEach(data, (value, key) => {
            let substitution = new Substitution(`{{${key}}}`, value);
            //noinspection TypeScriptUnresolvedVariable
            personalization.addSubstitution(substitution);
        });

        mail.addPersonalization(personalization);

        let request = this.sg.emptyRequest({
            method: "POST",
            path: "/v3/mail/send",
            body: mail.toJSON(),
        });

        let response = await this.sg.API(request);
        return response;
    }

    getEmailTemplateId(templateName) {
        let propKey = _.snakeCase("email_" + templateName).toUpperCase();
        let templateId = process.env[propKey];
        if (!templateId) {
            Logger.error(`[Service] [Email] You tried to access a template with the name ${templateName}. To set it's id set process.env.${propKey}`);
        }
        return templateId;
    }

}

const singleton = new EmailService(config.emails.sendgrid.apiKey);

export {singleton as EmailService};