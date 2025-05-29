import { getFirebaseDb } from './firebase'; // Import the function to get Firestore instance

/**
 * Updates the access_rights collection for a user.
 * Each document in the collection will be named after the graphic_novel_uid.
 * @param {string} userId - The ID of the user.
 * @param {Array} checkoutItems - The list of purchased items.
 */
export async function updateProductsAccess(userId, checkoutItems) {
  if (!Array.isArray(checkoutItems) || checkoutItems.length === 0) {
    console.log('No checkout items to process for access_rights.');
    return;
  }

  // console.log('/n/n<<<<<<<<   updateProductsAccess called with:', checkoutItems[0].product_uid);
  console.log('/n/n<<<<<<<<   updateProductsAccess called with:');
  
  // Separate valid and invalid items, and log invalid ones
  const validItems = [];
  checkoutItems.forEach((item, idx) => {
    if (
      item.product_uid &&
      item.product_uid.graphic_novel_uid &&
      item.product_uid.volume_uid &&
      item.product_uid.lang
    ) {
      validItems.push(item);
    } else {
      console.warn(`Invalid checkout item at index ${idx}:`, item);
    }
  });

  if (validItems.length === 0) {
    console.log('No valid checkout items to process for access_rights.');
    return;
  }

  // Get Firestore instance
  const db = getFirebaseDb();

  for (const item of checkoutItems) {
    if (
      item.product_uid &&
      item.product_uid.graphic_novel_uid &&
      item.product_uid.volume_uid &&
      item.product_uid.lang
    ) {
      const novelDocRef = db.doc(`users/${userId}/access_rights/${item.product_uid.graphic_novel_uid}`);
      const docSnap = await novelDocRef.get();
      const volumes = docSnap.exists && docSnap.data() ? docSnap.data() : {};

      // Skip if this language for this volume already exists
      if (
        volumes[item.product_uid.volume_uid] &&
        volumes[item.product_uid.volume_uid][item.product_uid.lang]
      ) {
        console.log(
          `Skip: Volume ${item.product_uid.volume_uid} with lang ${item.product_uid.lang} already exists for user ${userId}`
        );
        continue; // THIS MAKES IT IDEMPOTENT FOR THIS ITEM
      }

      // Add the new language entry only if it doesn't already exist
      await novelDocRef.set({
        [item.product_uid.volume_uid]: {
          ...(volumes[item.product_uid.volume_uid] || {}), // Preserve existing languages under this volume
          [item.product_uid.lang]: {
            ...(volumes[item.product_uid.volume_uid]?.[item.product_uid.lang] || {}), // Preserve existing data for this language
            graphicNovelUid: item.product_uid.graphic_novel_uid,
            volumeUid: item.product_uid.volume_uid,
            lang: item.product_uid.lang,
            createdAt: volumes[item.product_uid.volume_uid]?.[item.product_uid.lang]?.createdAt || new Date().toISOString(), // Preserve original createdAt if it exists
          }
        }
      }, { merge: true });
    } else {
      console.warn('Invalid checkout item:', item);
    }
  }

  console.log(`Successfully updated access_rights for user: ${userId}`);
}