const ASSET_NAMES = [
  'ship1.png',
  'ship2.png',
  'ship3.png',
  'ship4.png',
  'ship5.png',
  'ship6.png',
  'ship7.png',
  'ship8.png',
  'bullet.svg',
];

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
  return new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `/assets/${assetName}`;
  });
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];
