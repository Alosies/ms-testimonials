import { relations } from "drizzle-orm/relations";
import { plans, planPrices, media, organizations, users, userIdentities, organizationPlans, organizationRoles, roles, forms, formSteps, formQuestions, questionTypes, questionOptions, formQuestionResponses, formSubmissions, widgets, testimonials, widgetTestimonials, planQuestionTypes, contacts, mediaEntityTypes, flows, formAnalyticsEvents } from "./schema";

export const planPricesRelations = relations(planPrices, ({one}) => ({
	plan: one(plans, {
		fields: [planPrices.planId],
		references: [plans.id]
	}),
}));

export const plansRelations = relations(plans, ({many}) => ({
	planPrices: many(planPrices),
	organizationPlans: many(organizationPlans),
	planQuestionTypes: many(planQuestionTypes),
}));

export const organizationsRelations = relations(organizations, ({one, many}) => ({
	media_logoId: one(media, {
		fields: [organizations.logoId],
		references: [media.id],
		relationName: "organizations_logoId_media_id"
	}),
	user: one(users, {
		fields: [organizations.createdBy],
		references: [users.id]
	}),
	organizationPlans: many(organizationPlans),
	organizationRoles: many(organizationRoles),
	forms: many(forms),
	formQuestions: many(formQuestions),
	questionOptions: many(questionOptions),
	formQuestionResponses: many(formQuestionResponses),
	widgets: many(widgets),
	testimonials: many(testimonials),
	widgetTestimonials: many(widgetTestimonials),
	contacts: many(contacts),
	formSubmissions: many(formSubmissions),
	formSteps: many(formSteps),
	media_organizationId: many(media, {
		relationName: "media_organizationId_organizations_id"
	}),
	formAnalyticsEvents: many(formAnalyticsEvents),
	flows: many(flows),
}));

export const mediaRelations = relations(media, ({one, many}) => ({
	organizations: many(organizations, {
		relationName: "organizations_logoId_media_id"
	}),
	mediaEntityType: one(mediaEntityTypes, {
		fields: [media.entityType],
		references: [mediaEntityTypes.code]
	}),
	organization: one(organizations, {
		fields: [media.organizationId],
		references: [organizations.id],
		relationName: "media_organizationId_organizations_id"
	}),
	user: one(users, {
		fields: [media.uploadedBy],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	organizations: many(organizations),
	userIdentities: many(userIdentities),
	organizationPlans: many(organizationPlans),
	organizationRoles_invitedBy: many(organizationRoles, {
		relationName: "organizationRoles_invitedBy_users_id"
	}),
	organizationRoles_userId: many(organizationRoles, {
		relationName: "organizationRoles_userId_users_id"
	}),
	forms_createdBy: many(forms, {
		relationName: "forms_createdBy_users_id"
	}),
	forms_updatedBy: many(forms, {
		relationName: "forms_updatedBy_users_id"
	}),
	formQuestions: many(formQuestions),
	questionOptions: many(questionOptions),
	formQuestionResponses: many(formQuestionResponses),
	widgets_createdBy: many(widgets, {
		relationName: "widgets_createdBy_users_id"
	}),
	widgets_updatedBy: many(widgets, {
		relationName: "widgets_updatedBy_users_id"
	}),
	testimonials_approvedBy: many(testimonials, {
		relationName: "testimonials_approvedBy_users_id"
	}),
	testimonials_rejectedBy: many(testimonials, {
		relationName: "testimonials_rejectedBy_users_id"
	}),
	testimonials_updatedBy: many(testimonials, {
		relationName: "testimonials_updatedBy_users_id"
	}),
	widgetTestimonials: many(widgetTestimonials),
	planQuestionTypes_createdBy: many(planQuestionTypes, {
		relationName: "planQuestionTypes_createdBy_users_id"
	}),
	planQuestionTypes_updatedBy: many(planQuestionTypes, {
		relationName: "planQuestionTypes_updatedBy_users_id"
	}),
	formSubmissions: many(formSubmissions),
	mediaEntityTypes_createdBy: many(mediaEntityTypes, {
		relationName: "mediaEntityTypes_createdBy_users_id"
	}),
	mediaEntityTypes_updatedBy: many(mediaEntityTypes, {
		relationName: "mediaEntityTypes_updatedBy_users_id"
	}),
	formSteps_createdBy: many(formSteps, {
		relationName: "formSteps_createdBy_users_id"
	}),
	formSteps_updatedBy: many(formSteps, {
		relationName: "formSteps_updatedBy_users_id"
	}),
	media: many(media),
}));

export const userIdentitiesRelations = relations(userIdentities, ({one}) => ({
	user: one(users, {
		fields: [userIdentities.userId],
		references: [users.id]
	}),
}));

export const organizationPlansRelations = relations(organizationPlans, ({one}) => ({
	organization: one(organizations, {
		fields: [organizationPlans.organizationId],
		references: [organizations.id]
	}),
	user: one(users, {
		fields: [organizationPlans.overriddenBy],
		references: [users.id]
	}),
	plan: one(plans, {
		fields: [organizationPlans.planId],
		references: [plans.id]
	}),
}));

export const organizationRolesRelations = relations(organizationRoles, ({one}) => ({
	user_invitedBy: one(users, {
		fields: [organizationRoles.invitedBy],
		references: [users.id],
		relationName: "organizationRoles_invitedBy_users_id"
	}),
	organization: one(organizations, {
		fields: [organizationRoles.organizationId],
		references: [organizations.id]
	}),
	role: one(roles, {
		fields: [organizationRoles.roleId],
		references: [roles.id]
	}),
	user_userId: one(users, {
		fields: [organizationRoles.userId],
		references: [users.id],
		relationName: "organizationRoles_userId_users_id"
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	organizationRoles: many(organizationRoles),
}));

export const formsRelations = relations(forms, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [forms.createdBy],
		references: [users.id],
		relationName: "forms_createdBy_users_id"
	}),
	organization: one(organizations, {
		fields: [forms.organizationId],
		references: [organizations.id]
	}),
	user_updatedBy: one(users, {
		fields: [forms.updatedBy],
		references: [users.id],
		relationName: "forms_updatedBy_users_id"
	}),
	contacts: many(contacts),
	formSubmissions: many(formSubmissions),
	formAnalyticsEvents: many(formAnalyticsEvents),
	flows: many(flows),
}));

export const formQuestionsRelations = relations(formQuestions, ({one, many}) => ({
	formStep: one(formSteps, {
		fields: [formQuestions.stepId],
		references: [formSteps.id]
	}),
	organization: one(organizations, {
		fields: [formQuestions.organizationId],
		references: [organizations.id]
	}),
	questionType: one(questionTypes, {
		fields: [formQuestions.questionTypeId],
		references: [questionTypes.id]
	}),
	user: one(users, {
		fields: [formQuestions.updatedBy],
		references: [users.id]
	}),
	questionOptions: many(questionOptions),
	formQuestionResponses: many(formQuestionResponses),
	flows: many(flows),
}));

export const formStepsRelations = relations(formSteps, ({one, many}) => ({
	formQuestions: many(formQuestions),
	user_createdBy: one(users, {
		fields: [formSteps.createdBy],
		references: [users.id],
		relationName: "formSteps_createdBy_users_id"
	}),
	flow: one(flows, {
		fields: [formSteps.flowId],
		references: [flows.id]
	}),
	organization: one(organizations, {
		fields: [formSteps.organizationId],
		references: [organizations.id]
	}),
	user_updatedBy: one(users, {
		fields: [formSteps.updatedBy],
		references: [users.id],
		relationName: "formSteps_updatedBy_users_id"
	}),
}));

export const questionTypesRelations = relations(questionTypes, ({many}) => ({
	formQuestions: many(formQuestions),
	planQuestionTypes: many(planQuestionTypes),
}));

export const questionOptionsRelations = relations(questionOptions, ({one}) => ({
	user: one(users, {
		fields: [questionOptions.createdBy],
		references: [users.id]
	}),
	organization: one(organizations, {
		fields: [questionOptions.organizationId],
		references: [organizations.id]
	}),
	formQuestion: one(formQuestions, {
		fields: [questionOptions.questionId],
		references: [formQuestions.id]
	}),
}));

export const formQuestionResponsesRelations = relations(formQuestionResponses, ({one}) => ({
	organization: one(organizations, {
		fields: [formQuestionResponses.organizationId],
		references: [organizations.id]
	}),
	formQuestion: one(formQuestions, {
		fields: [formQuestionResponses.questionId],
		references: [formQuestions.id]
	}),
	formSubmission: one(formSubmissions, {
		fields: [formQuestionResponses.submissionId],
		references: [formSubmissions.id]
	}),
	user: one(users, {
		fields: [formQuestionResponses.updatedBy],
		references: [users.id]
	}),
}));

export const formSubmissionsRelations = relations(formSubmissions, ({one, many}) => ({
	formQuestionResponses: many(formQuestionResponses),
	testimonials: many(testimonials),
	contact: one(contacts, {
		fields: [formSubmissions.contactId],
		references: [contacts.id]
	}),
	form: one(forms, {
		fields: [formSubmissions.formId],
		references: [forms.id]
	}),
	organization: one(organizations, {
		fields: [formSubmissions.organizationId],
		references: [organizations.id]
	}),
	user: one(users, {
		fields: [formSubmissions.updatedBy],
		references: [users.id]
	}),
}));

export const widgetsRelations = relations(widgets, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [widgets.createdBy],
		references: [users.id],
		relationName: "widgets_createdBy_users_id"
	}),
	organization: one(organizations, {
		fields: [widgets.organizationId],
		references: [organizations.id]
	}),
	user_updatedBy: one(users, {
		fields: [widgets.updatedBy],
		references: [users.id],
		relationName: "widgets_updatedBy_users_id"
	}),
	widgetTestimonials: many(widgetTestimonials),
}));

export const testimonialsRelations = relations(testimonials, ({one, many}) => ({
	user_approvedBy: one(users, {
		fields: [testimonials.approvedBy],
		references: [users.id],
		relationName: "testimonials_approvedBy_users_id"
	}),
	organization: one(organizations, {
		fields: [testimonials.organizationId],
		references: [organizations.id]
	}),
	user_rejectedBy: one(users, {
		fields: [testimonials.rejectedBy],
		references: [users.id],
		relationName: "testimonials_rejectedBy_users_id"
	}),
	formSubmission: one(formSubmissions, {
		fields: [testimonials.submissionId],
		references: [formSubmissions.id]
	}),
	user_updatedBy: one(users, {
		fields: [testimonials.updatedBy],
		references: [users.id],
		relationName: "testimonials_updatedBy_users_id"
	}),
	widgetTestimonials: many(widgetTestimonials),
}));

export const widgetTestimonialsRelations = relations(widgetTestimonials, ({one}) => ({
	user: one(users, {
		fields: [widgetTestimonials.addedBy],
		references: [users.id]
	}),
	organization: one(organizations, {
		fields: [widgetTestimonials.organizationId],
		references: [organizations.id]
	}),
	testimonial: one(testimonials, {
		fields: [widgetTestimonials.testimonialId],
		references: [testimonials.id]
	}),
	widget: one(widgets, {
		fields: [widgetTestimonials.widgetId],
		references: [widgets.id]
	}),
}));

export const planQuestionTypesRelations = relations(planQuestionTypes, ({one}) => ({
	user_createdBy: one(users, {
		fields: [planQuestionTypes.createdBy],
		references: [users.id],
		relationName: "planQuestionTypes_createdBy_users_id"
	}),
	plan: one(plans, {
		fields: [planQuestionTypes.planId],
		references: [plans.id]
	}),
	questionType: one(questionTypes, {
		fields: [planQuestionTypes.questionTypeId],
		references: [questionTypes.id]
	}),
	user_updatedBy: one(users, {
		fields: [planQuestionTypes.updatedBy],
		references: [users.id],
		relationName: "planQuestionTypes_updatedBy_users_id"
	}),
}));

export const contactsRelations = relations(contacts, ({one, many}) => ({
	organization: one(organizations, {
		fields: [contacts.organizationId],
		references: [organizations.id]
	}),
	form: one(forms, {
		fields: [contacts.sourceFormId],
		references: [forms.id]
	}),
	formSubmissions: many(formSubmissions),
}));

export const mediaEntityTypesRelations = relations(mediaEntityTypes, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [mediaEntityTypes.createdBy],
		references: [users.id],
		relationName: "mediaEntityTypes_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [mediaEntityTypes.updatedBy],
		references: [users.id],
		relationName: "mediaEntityTypes_updatedBy_users_id"
	}),
	media: many(media),
}));

export const flowsRelations = relations(flows, ({one, many}) => ({
	formSteps: many(formSteps),
	formQuestion: one(formQuestions, {
		fields: [flows.branchQuestionId],
		references: [formQuestions.id]
	}),
	form: one(forms, {
		fields: [flows.formId],
		references: [forms.id]
	}),
	organization: one(organizations, {
		fields: [flows.organizationId],
		references: [organizations.id]
	}),
}));

export const formAnalyticsEventsRelations = relations(formAnalyticsEvents, ({one}) => ({
	form: one(forms, {
		fields: [formAnalyticsEvents.formId],
		references: [forms.id]
	}),
	organization: one(organizations, {
		fields: [formAnalyticsEvents.organizationId],
		references: [organizations.id]
	}),
}));