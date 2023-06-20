import api, { route } from "@forge/api";

/**
 * @issueKey - the Jira key for the issue that will be embedded in the new Confluence page
 */
async function addPage(issueKey, parentId, spaceId) {
  // To get the server ID:
  //   1. create a Confluence page and insert a Jira issue macro.
  //   2. Enter the following URL in your browser, substituting the pageId value:
  //        https://forgery.atlassian.net/wiki/api/v2/pages/{pageId}?body-format=storage
  //   3. Search for "serverId" and retrieve the value after it.
  const jiraServerId = '44cec7fd-c7a6-3972-8f8e-a26e5b95551d';
  const columnNames = `key,summary,type,created,updated,due,assignee,reporter,priority,status,resolution`;
  //const now = new Date().getTime();
  //const localId = `any-id-${now}`;
  //const macroId = `any-id-${now + 1}`;
  // Build the Issue Macro
  const issueMacro =
    `<ac:structured-macro
      ac:name=\"jira\"
      ac:schema-version=\"1\"
      ac:local-id=\"\"
      ac:macro-id=\"\">
      <ac:parameter ac:name=\"server\">System JIRA</ac:parameter>
      <ac:parameter ac:name=\"columns\">${columnNames}</ac:parameter>
      <ac:parameter ac:name=\"maximumIssues\">20</ac:parameter>
      <ac:parameter ac:name=\"jqlQuery\">
        issueKey = &quot;${issueKey}&quot; 
      </ac:parameter>
      <ac:parameter ac:name=\"serverId\">${jiraServerId}</ac:parameter>
    </ac:structured-macro>`;
  // Build the API request body
  const body = {
    title: `New page created for ${issueKey}`,
    type: "page",
    parentId: parentId,
    spaceId: spaceId,
    body: {
      storage: {
        value: `<p>${issueMacro}</p>`,
        representation: "storage"
      }
    }
  };
  console.log(` * body: ${JSON.stringify(body, null, 2)}`);
  // Send the request to the Confluence REST API
  let response = await api.asApp().requestConfluence(route`/wiki/api/v2/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
  console.log(await response.json());
}

export async function onIssueCreated(event, context) {
	console.log('Issue created:');
  console.log(` * event: ${JSON.stringify(event, null, 2)}`);
  console.log(` * context: ${JSON.stringify(context, null, 2)}`);

  // Specify which page the new page should be created under. Visit the page and copy the ID
  // from the URL. For example, the ID of the following page is 1496317953
  // https://mytenant.atlassian.net/wiki/spaces/TEST/pages/1496317953/My+page+name

  const parentId = 122322945;
  // Now that you have the parent page ID, you can determine the spaceId by entering the
  // following URL in a browser and inspecting the response.
  // https://mytenant.atlassian.net/wiki/api/v2/pages/{parentId}
  // For the above example, it would be:
  // https://mytenant.atlassian.net/wiki/api/v2/pages/1496317953
  const spaceId = 98306;
  await addPage(event.issue.key, parentId, spaceId);
}