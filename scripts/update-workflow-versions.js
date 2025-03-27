const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Function to fetch Tailwind versions from npm
function getTailwindVersions() {
  try {
    const versions = JSON.parse(execSync('npm view tailwindcss versions --json').toString());
    return versions.sort((a, b) => {
      const [majorA, minorA, patchA] = a.split('.').map(Number);
      const [majorB, minorB, patchB] = b.split('.').map(Number);
      return majorB - majorA || minorB - minorA || patchB - patchA;
    }).slice(0, 10);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return [];
  }
}

// Function to update the workflow file
function updateWorkflowFile(versions) {
  const workflowPath = path.join(__dirname, '../.github/workflows/select-and-bump-tailwind.yml');
  let content = fs.readFileSync(workflowPath, 'utf8');

  // Create the options string
  const options = ['latest', ...versions].map(v => `          - '${v}'`).join('\n');

  // Replace the version options in the workflow file
  content = content.replace(
    /type: string\n\s+default: 'latest'/,
    `type: choice\n        options:\n${options}\n        default: 'latest'`
  );

  fs.writeFileSync(workflowPath, content);
  console.log('Workflow file updated successfully!');
}

// Main execution
const versions = getTailwindVersions();
updateWorkflowFile(versions); 