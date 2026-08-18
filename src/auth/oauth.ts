import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import IdentityManager from "@arcgis/core/identity/IdentityManager.js";
import { config } from "@/config/env";

let registered = false;

function registerOAuth(): void {
  if (registered) return;

  const info = new OAuthInfo({
    appId: config.clientId,
    portalUrl: config.portalUrl,
    // ВАЖЛИВО: popup=false, використовуємо redirect замість popup для OAuth
    popup: false,
  });

  IdentityManager.registerOAuthInfos([info]);
  registered = true;
}

/**
 * Ініціює/перевіряє автентифікацію проти Portal.
 * Якщо користувач ще не залогінений — редиректить на сторінку логіну Portal (SSO).
 * Повертає Credential після успішного логіну.
 */
export async function ensureSignedIn() {
  registerOAuth();
  return IdentityManager.getCredential(`${config.portalUrl}/sharing`);
}

export function signOut(): void {
  IdentityManager.destroyCredentials();
  // Після знищення credential — сторінку варто перезавантажити,
  // щоб скинути стан вбудованих Esri-віджетів.
  window.location.reload();
}
