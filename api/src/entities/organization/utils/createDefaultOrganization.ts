import { executeGraphQL } from '@/shared/libs/hasura';
import {
  CreateOrganizationDocument,
  FindFreePlanDocument,
  CreateOrganizationPlanDocument,
  FindRoleByUniqueNameDocument,
  AssignRoleDocument,
  type FindFreePlanQuery,
} from '@/graphql/generated/operations';
import { roleUniqueNames } from '@/shared/constants';
import type { Organization } from '../models';

type Plan = FindFreePlanQuery['plans'][0];

/**
 * Generate a URL-safe slug from user's name or email
 */
function generateSlug(displayName: string | null, email: string): string {
  const base = displayName || email.split('@')[0];
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${suffix}`;
}

/**
 * Create default organization for a new user
 * This includes:
 * 1. Create organization
 * 2. Assign free plan
 * 3. Assign owner role to user
 */
export async function createDefaultOrganization(
  userId: string,
  displayName: string | null,
  email: string
): Promise<Organization | null> {
  try {
    // 1. Create the organization
    const orgName = displayName ? `${displayName}'s Workspace` : `${email.split('@')[0]}'s Workspace`;
    const slug = generateSlug(displayName, email);

    const { data: orgData, error: orgError } = await executeGraphQL<
      { insert_organizations_one: Organization | null },
      { name: string; slug: string; created_by: string; setup_status: 'pending_setup' | 'completed' }
    >(CreateOrganizationDocument, {
      name: orgName,
      slug,
      created_by: userId,
      setup_status: 'pending_setup',
    });

    if (orgError || !orgData?.insert_organizations_one) {
      console.error('Error creating organization:', orgError);
      return null;
    }

    const organization = orgData.insert_organizations_one;

    // 2. Get free plan details
    const { data: planData, error: planError } = await executeGraphQL<
      { plans: Plan[] },
      Record<string, never>
    >(FindFreePlanDocument, {});

    if (planError || !planData?.plans[0]) {
      console.error('Error finding free plan:', planError);
      // Continue anyway - org was created
    } else {
      const freePlan = planData.plans[0];

      // 3. Create organization plan subscription
      await executeGraphQL<
        { insert_organization_plans_one: { id: string } | null },
        {
          organization_id: string;
          plan_id: string;
          max_forms: number;
          max_members: number;
          max_testimonials: number;
          max_widgets: number;
          show_branding: boolean;
        }
      >(CreateOrganizationPlanDocument, {
        organization_id: organization.id,
        plan_id: freePlan.id,
        max_forms: freePlan.max_forms,
        max_members: freePlan.max_members,
        max_testimonials: freePlan.max_testimonials,
        max_widgets: freePlan.max_widgets,
        show_branding: freePlan.show_branding,
      });
    }

    // 4. Get owner role
    const { data: roleData, error: roleError } = await executeGraphQL<
      { roles: { id: string; name: string; unique_name: string }[] },
      { uniqueName: string }
    >(FindRoleByUniqueNameDocument, { uniqueName: roleUniqueNames.OWNER });

    if (roleError || !roleData?.roles[0]) {
      console.error('Error finding owner role:', roleError);
      return organization; // Return org anyway
    }

    const ownerRole = roleData.roles[0];

    // 5. Assign owner role to user
    await executeGraphQL<
      { insert_organization_roles_one: { id: string } | null },
      { organization_id: string; user_id: string; role_id: string; is_default_org: boolean }
    >(AssignRoleDocument, {
      organization_id: organization.id,
      user_id: userId,
      role_id: ownerRole.id,
      is_default_org: true, // First org is default
    });

    return organization;
  } catch (error) {
    console.error('Error in createDefaultOrganization:', error);
    return null;
  }
}
