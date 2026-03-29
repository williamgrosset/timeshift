const TWITCH_GQL_URL = 'https://gql.twitch.tv/gql';
const CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

export interface TwitchVod {
  id: string;
  title: string;
  createdAt: string;
  lengthSeconds: number;
  broadcastType: string;
}

/**
 * Fetch the most recent VOD (archive) for a channel.
 * Returns null if no VOD is available.
 */
export async function getLatestVod(channelLogin: string): Promise<TwitchVod | null> {
  const query = {
    query: `
      query GetLatestVod($login: String!) {
        user(login: $login) {
          videos(first: 1, type: ARCHIVE, sort: TIME) {
            edges {
              node {
                id
                title
                createdAt
                lengthSeconds
                broadcastType
              }
            }
          }
        }
      }
    `,
    variables: { login: channelLogin },
  };

  try {
    const res = await fetch(TWITCH_GQL_URL, {
      method: 'POST',
      headers: {
        'Client-ID': CLIENT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!res.ok) {
      console.warn(`[Timeshift] GQL request failed: ${res.status}`);
      return null;
    }

    const data = await res.json();
    console.log('[Timeshift] GQL response:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.warn('[Timeshift] GQL errors:', data.errors);
      return null;
    }

    const edges = data?.data?.user?.videos?.edges;
    if (!edges || edges.length === 0) {
      console.log('[Timeshift] No VODs found for channel');
      return null;
    }

    const vod = edges[0].node as TwitchVod;
    console.log(`[Timeshift] Latest VOD: id=${vod.id}, created=${vod.createdAt}, length=${vod.lengthSeconds}s`);
    return vod;
  } catch (err) {
    console.warn('[Timeshift] GQL fetch error:', err);
    return null;
  }
}
