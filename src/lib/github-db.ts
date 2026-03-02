// GitHub as Database - Permanent Storage
// Data persists forever in the GitHub repository

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'mohammaduzzalmiahbd-design';
const GITHUB_REPO = process.env.GITHUB_REPO || 'apon_foundation';
const DATA_FILE = 'data/foundation-data.json';
const GITHUB_API = 'https://api.github.com';

// Save data to GitHub
export async function saveToGitHub(data: any): Promise<{ success: boolean; message: string }> {
  if (!GITHUB_TOKEN) {
    return { success: false, message: 'GitHub token not configured' };
  }

  try {
    // Get current file SHA
    let sha = null;
    try {
      const getResponse = await fetch(
        `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File might not exist yet
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    const body: any = {
      message: `Update data - ${new Date().toISOString()}`,
      content: content,
      committer: {
        name: 'Apon Foundation',
        email: 'aponfoundation.baligaw@gmail.com',
      },
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      console.log('✅ Data saved to GitHub');
      return { success: true, message: 'GitHub-এ সেভ হয়েছে!' };
    } else {
      const error = await response.json();
      console.error('GitHub save error:', error);
      return { success: false, message: 'GitHub সেভ ব্যর্থ' };
    }
  } catch (error) {
    console.error('Save error:', error);
    return { success: false, message: 'সেভ করতে সমস্যা হয়েছে' };
  }
}

// Load data from GitHub (via raw URL - faster)
export async function loadFromGitHub(): Promise<any | null> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/master/${DATA_FILE}`,
      {
        cache: 'no-store',
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Data loaded from GitHub');
      return data;
    }
    return null;
  } catch (error) {
    console.error('Load error:', error);
    return null;
  }
}
