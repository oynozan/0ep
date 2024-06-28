export const NibiruMainnet = {
    rpc: "https://rpc.nibiru.fi",
    rest: "https://lcd.nibiru.fi",
    chainId: "cataclysm-1",
    chainName: "Nibiru",
    bip44: {
        coinType: 118,
    },
    bech32Config: {
        bech32PrefixAccAddr: "nibi",
        bech32PrefixAccPub: "nibipub",
        bech32PrefixValAddr: "nibivaloper",
        bech32PrefixValPub: "nibivaloperpub",
        bech32PrefixConsAddr: "nibivalcons",
        bech32PrefixConsPub: "nibivalconspub",
    },
    currencies: [
        {
            coinDenom: "NIBI",
            coinMinimalDenom: "unibi",
            coinDecimals: 6,
            coinGeckoId: "nibiru",
            coinImageUrl:
                "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.svg",
        },
        {
            coinDenom: "UOPREK",
            coinMinimalDenom:
                "tf/nibi149m52kn7nvsg5nftvv4fh85scsavpdfxp5nr7zasz97dum89dp5qkyhy0t/uoprek",
            coinDecimals: 0,
        },
        {
            coinDenom: "UTESTATE",
            coinMinimalDenom:
                "tf/nibi1lp28kx3gz0prsztl024z730ufkg3alahaq3e7a6gae22nk0dqdvsyrrgqw/utestate",
            coinDecimals: 0,
        },
        {
            coinDenom: "NPP",
            coinMinimalDenom:
                "tf/nibi1xpp7yn0tce62ffattws3gpd6v0tah0mlevef3ej3r4pnfvsehcgqk3jvxq/NPP",
            coinDecimals: 0,
        },
    ],
    stakeCurrency: {
        coinDenom: "NIBI",
        coinMinimalDenom: "unibi",
        coinDecimals: 6,
        coinGeckoId: "nibiru",
        coinImageUrl:
            "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.svg",
    },
    feeCurrencies: [
        {
            coinDenom: "NIBI",
            coinMinimalDenom: "unibi",
            coinDecimals: 6,
            coinGeckoId: "nibiru",
            coinImageUrl:
                "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.svg",
            gasPriceStep: {
                low: 0.025,
                average: 0.05,
                high: 0.1,
            },
        },
    ],
    features: ["ibc-transfer", "cosmwasm"],
    beta: true,
};
