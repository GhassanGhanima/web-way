import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private readonly templatesDir: string;
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.templatesDir = path.join(process.cwd(), 'src/templates/email');
    this.loadTemplates();
  }

  private loadTemplates() {
    try {
      // Register partials
      const partialsDir = path.join(this.templatesDir, 'partials');
      if (fs.existsSync(partialsDir)) {
        const partialFiles = fs.readdirSync(partialsDir).filter(file => file.endsWith('.hbs'));
        
        for (const file of partialFiles) {
          const partialName = path.basename(file, '.hbs');
          const partialContent = fs.readFileSync(path.join(partialsDir, file), 'utf-8');
          handlebars.registerPartial(partialName, partialContent);
        }
      }

      // Load templates
      const templateFiles = fs.readdirSync(this.templatesDir).filter(file => 
        file.endsWith('.hbs') && !fs.statSync(path.join(this.templatesDir, file)).isDirectory()
      );
      
      for (const file of templateFiles) {
        const templateName = path.basename(file, '.hbs');
        this.loadTemplate(templateName);
      }
      
      this.logger.log(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      this.logger.error(`Failed to load email templates: ${error.message}`, error.stack);
    }
  }

  private loadTemplate(templateName: string) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      
      this.templates.set(templateName, template);
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}: ${error.message}`);
    }
  }

  renderTemplate(templateName: string, context: any): string {
    let template = this.templates.get(templateName);
    
    if (!template) {
      // Try to load template if not already loaded
      this.loadTemplate(templateName);
      template = this.templates.get(templateName);
      
      if (!template) {
        this.logger.warn(`Template ${templateName} not found, using fallback`);
        return this.renderFallbackTemplate(context);
      }
    }
    
    try {
      return template(context);
    } catch (error) {
      this.logger.error(`Error rendering template ${templateName}: ${error.message}`);
      return this.renderFallbackTemplate(context);
    }
  }

  private renderFallbackTemplate(context: any): string {
    // Simple fallback template
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${context.subject || 'Notification'}</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>${context.subject || 'Notification'}</h1>
          <p>${context.message || 'Please check your account for updates.'}</p>
          ${context.url ? `<p><a href="${context.url}">Click here</a> for more information.</p>` : ''}
          <p>Thank you,<br>The Accessibility Tool Team</p>
        </div>
      </body>
      </html>
    `;
  }
}
