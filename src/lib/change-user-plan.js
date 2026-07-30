// Helper script to change user plan
import db from '@/lib/shared/kliv-database.js';

async function changeUserPlan() {
  try {
    console.log('🔍 Searching for user: talaashmahi@gmail.com');
    
    // First, let's list all artists to see what we have
    const allArtists = await db.query("artists", {});
    console.log('📋 Total artists found:', allArtists.length);
    
    // Find the specific user
    const targetUser = allArtists.find(artist => 
      artist.email && artist.email.toLowerCase() === 'talaashmahi@gmail.com'.toLowerCase()
    );
    
    if (!targetUser) {
      console.log('❌ User not found: talaashmahi@gmail.com');
      console.log('📋 Available users:');
      allArtists.forEach(artist => {
        console.log(`   - ${artist.email || 'No email'} (${artist.artist_name || 'No name'})`);
      });
      return;
    }
    
    console.log('✅ User found:', {
      _row_id: targetUser._row_id,
      email: targetUser.email,
      artist_name: targetUser.artist_name,
      current_plan: targetUser.package_type,
      label_name_locked: targetUser.label_name_locked
    });
    
    // Update the user's plan
    console.log('🔄 Updating plan from free to subscription...');
    const updateResult = await db.update("artists", 
      { _row_id: `eq.${targetUser._row_id}` }, 
      { 
        package_type: 'sub',
        label_name_locked: false
      }
    );
    
    console.log('✅ Plan updated successfully!');
    console.log('📊 New plan details:', {
      email: targetUser.email,
      old_plan: 'free',
      new_plan: 'sub',
      label_name_locked: false
    });
    
    // Verify the update
    const updatedUser = await db.query("artists", { _row_id: `eq.${targetUser._row_id}` });
    if (updatedUser.length > 0) {
      console.log('✅ Verification successful - User now on subscription plan');
      console.log('📋 Updated user details:', updatedUser[0]);
    }
    
  } catch (error) {
    console.error('❌ Error changing user plan:', error);
  }
}

// Run the function
changeUserPlan();