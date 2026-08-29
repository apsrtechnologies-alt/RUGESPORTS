/**
 * Google Authentication Service
 * Implements Google Identity Services (GSI) & OAuth 2.0 Client integration
 */

export const GOOGLE_CLIENT_ID = '983391484011-20hvbcpdaen98ed2ms17de8viffm0sf1.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (notification?: any) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: (overrideConfig?: any) => void;
          };
          initCodeClient?: (config: any) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  sub?: string;
}

/**
 * Decode JWT token payload from Google GSI credential
 */
export function decodeGoogleCredential(credential: string): GoogleUserInfo | null {
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error decoding Google JWT credential:', err);
    return null;
  }
}

/**
 * Trigger OAuth 2.0 popup sign-in using Google Identity Services token client
 */
export function triggerGoogleOAuthPopup(
  onSuccess: (userInfo: GoogleUserInfo, accessToken?: string) => void,
  onError: (error: any) => void
): void {
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    console.warn('Google Identity Services SDK not loaded yet');
    onError(new Error('Google Sign-In SDK is loading. Please try again in a moment.'));
    return;
  }

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          onError(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }

        if (tokenResponse.access_token) {
          try {
            // Fetch Google userinfo with the obtained access token
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch user profile from Google');
            const data = await res.json();
            onSuccess(
              {
                email: data.email,
                name: data.name || data.given_name || data.email.split('@')[0],
                picture: data.picture,
                sub: data.sub,
              },
              tokenResponse.access_token
            );
          } catch (fetchErr) {
            onError(fetchErr);
          }
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err) {
    console.error('Failed to initialize Google Token Client:', err);
    onError(err);
  }
}

/**
 * Render official Google GSI Sign-In button into a container element
 */
export function renderGoogleButton(
  container: HTMLElement,
  onCredentialReceived: (credential: string) => void,
  options?: { theme?: 'outline' | 'filled_blue' | 'filled_black'; size?: 'large' | 'medium' | 'small'; text?: string; width?: number }
): void {
  if (typeof window === 'undefined' || !window.google?.accounts?.id) {
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        if (response.credential) {
          onCredentialReceived(response.credential);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      shape: 'rectangular',
      theme: options?.theme || 'outline',
      text: options?.text || 'signin_with',
      size: options?.size || 'large',
      logo_alignment: 'left',
      width: options?.width || (container.clientWidth > 0 ? container.clientWidth : 280),
    });
  } catch (err) {
    console.warn('Could not render Google Button:', err);
  }
}
