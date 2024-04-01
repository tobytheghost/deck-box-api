export const getScryfallImagesFromUid = (uid: string) => {
  const BASE_URL = "https://cards.scryfall.io/";
  return {
    small: `${BASE_URL}small/front/${uid[0]}/${uid[1]}/${uid}.jpg`,
    normal: `${BASE_URL}normal/front/${uid[0]}/${uid[1]}/${uid}.jpg`,
    large: `${BASE_URL}large/front/${uid[0]}/${uid[1]}/${uid}.jpg`,
  };
};
