/**
 * Lists Analytics accounts.
 */
function listAccounts() {
  var accounts = Analytics.Management.Accounts.list();
  if (accounts.items && accounts.items.length) {
    for (var i = 0; i < accounts.items.length; i++) {
      var account = accounts.items[i];
      Logger.log('Account: name "%s", id "%s".', account.name, account.id);

      // List web properties in the account.
      listWebProperties(account.id);
    }
  } else {
    Logger.log('No accounts found.');
  }
}

/**
 * Lists web properites for an Analytics account.
 * @param  {string} accountId The account ID.
 */
function listWebProperties(accountId) {
  var webProperties = Analytics.Management.Webproperties.list(accountId);
  if (webProperties.items && webProperties.items.length) {
    for (var i = 0; i < webProperties.items.length; i++) {
      var webProperty = webProperties.items[i];
      Logger.log('\tWeb Property: name "%s", id "%s".', webProperty.name,
          webProperty.id);

      // List profiles in the web property.
      listProfiles(accountId, webProperty.id);
      }
  } else {
    Logger.log('\tNo web properties found.');
  }
}

/**
 * Logs a list of Analytics accounts profiles.
 * @param  {string} accountId     The Analytics account ID
 * @param  {string} webPropertyId The web property ID
 */
function listProfiles(accountId, webPropertyId) {
  // Note: If you experience "Quota Error: User Rate Limit Exceeded" errors
  // due to the number of accounts or profiles you have, you may be able to
  // avoid it by adding a Utilities.sleep(1000) statement here.

  var profiles = Analytics.Management.Profiles.list(accountId,
      webPropertyId);
  if (profiles.items && profiles.items.length) {
    for (var i = 0; i < profiles.items.length; i++) {
      var profile = profiles.items[i];
      Logger.log('\t\tProfile: name "%s", id "%s".', profile.name,
          profile.id);
    }
  } else {
    Logger.log('\t\tNo web properties found.');
  }
}