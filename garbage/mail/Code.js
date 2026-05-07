function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  
  // Verify secret token to prevent unauthorized usage
  var secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (secret && data.secret !== secret) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  GmailApp.sendEmail(data.to, data.subject, data.text, {
    htmlBody: data.html,
    name: data.senderName || "PlayPen House"
  });
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
