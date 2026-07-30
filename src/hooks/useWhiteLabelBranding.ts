import { useState, useEffect } from 'react';
import auth from '@/lib/shared/kliv-auth.js';
import db from '@/lib/shared/kliv-database.js';

interface WhiteLabelBranding {
  name: string;
  logo_path?: string;
  primary_color?: string;
  secondary_color?: string;
  support_email?: string;
}

export const useWhiteLabelBranding = () => {
  const [branding, setBranding] = useState<WhiteLabelBranding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const currentUser = await auth.getUser();
        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Check if user is main admin - no branding for main admin
        const userMetadata = currentUser.appMetadata || {};
        const isAdmin = userMetadata.role === 'admin' || currentUser.email === 'info@unionmusicgroup.co.uk';
        
        if (isAdmin) {
          setBranding(null);
          setLoading(false);
          return;
        }

        // Load white label branding for regular users
        const whiteLabelUsers = await db.query('white_label_users', {
          user_email: `eq.${currentUser.email}`
        });

        if (whiteLabelUsers.length > 0) {
          const whiteLabelId = whiteLabelUsers[0].white_label_id;
          const whiteLabels = await db.query('white_labels', {
            _row_id: `eq.${whiteLabelId}`
          });

          if (whiteLabels.length > 0) {
            setBranding({
              name: whiteLabels[0].name,
              logo_path: whiteLabels[0].logo_path,
              primary_color: whiteLabels[0].primary_color,
              secondary_color: whiteLabels[0].secondary_color,
              support_email: whiteLabels[0].support_email
            });
          }
        }
      } catch (error) {
        console.log('No white label branding found:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBranding();
  }, []);

  return { branding, loading };
};