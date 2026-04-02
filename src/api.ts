import type { Tournament } from './types';

const API_URL = 'https://643fba8d3dee5b763e23c426.mockapi.io/tournament';
const TOURNAMENT_ID = '1';

export const getTournament = async (): Promise<Tournament | null> => {
  try {
    const response = await fetch(`${API_URL}/${TOURNAMENT_ID}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
};

export const saveTournament = async (tournament: Tournament): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${TOURNAMENT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tournament),
    });
    
    if (response.status === 404) {
      // If not found, try to create it (POST)
      const createResponse = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tournament, id: TOURNAMENT_ID }),
      });
      return createResponse.ok;
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error saving tournament:', error);
    return false;
  }
};
