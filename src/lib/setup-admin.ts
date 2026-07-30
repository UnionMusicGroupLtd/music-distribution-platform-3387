import auth from '@/lib/shared/kliv-auth.js';

/**
 * Setup Admin User Script
 * This script sets up info@unionmusicgroup.co.uk as an admin user
 * by updating their appMetadata to include admin role
 */

async function setupAdminUser() {
  try {
    // Get current user to verify we're logged in
    const currentUser = await auth.getUser();
    if (!currentUser) {
      console.error('You must be logged in to run this script');
      return;
    }

    console.log('Setting up admin user for info@unionmusicgroup.co.uk...');

    // The email we want to make admin
    const targetEmail = 'info@unionmusicgroup.co.uk';
    
    // List users to find the target user
    const usersList = await auth.listUsers({ 
      search: { email: targetEmail } 
    });

    if (!usersList.data || usersList.data.length === 0) {
      console.error(`User ${targetEmail} not found`);
      return;
    }

    const targetUser = usersList.data[0];
    console.log(`Found user: ${targetUser.email} (UUID: ${targetUser.userUuid})`);

    // Update the user's appMetadata to include admin role
    // Note: This completely replaces existing metadata, so we preserve other fields
    const existingMetadata = targetUser.userMetadata || {};
    
    await auth.updateUserByUuid(targetUser.userUuid, {
      metadata: {
        ...existingMetadata,
        role: 'admin',
        adminSince: new Date().toISOString()
      }
    });

    console.log(`✅ Successfully set ${targetEmail} as admin!`);
    console.log(`   - Role: admin`);
    console.log(`   - Admin since: ${new Date().toISOString()}`);
    console.log(`   - User can now access /admin dashboard`);

  } catch (error) {
    console.error('Error setting up admin user:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Auto-execute for setup
setupAdminUser();

export { setupAdminUser };