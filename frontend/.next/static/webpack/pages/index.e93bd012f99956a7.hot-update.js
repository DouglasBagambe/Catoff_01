"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "./hooks/useSolanaChallenge.ts":
/*!*************************************!*\
  !*** ./hooks/useSolanaChallenge.ts ***!
  \*************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useSolanaChallenge: () => (/* binding */ useSolanaChallenge)\n/* harmony export */ });\n/* harmony import */ var _solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @solana/wallet-adapter-react */ \"../node_modules/@solana/wallet-adapter-react/lib/esm/index.js\");\n/* harmony import */ var _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @project-serum/anchor */ \"../node_modules/@project-serum/anchor/dist/browser/index.js\");\n/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @solana/web3.js */ \"../node_modules/@solana/web3.js/lib/index.browser.esm.js\");\n/* harmony import */ var _types_gaming_challenge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/gaming_challenge */ \"./types/gaming_challenge.ts\");\n// frontend/hooks/useSolanaChallenge.ts\n\n\n\n\n\nconst PROGRAM_ID = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(\"GBUZP3faF5m8nctD6NwoC5ZCGNbq95d1g53LuR7U97FS\");\nconst useSolanaChallenge = ()=>{\n    const { connection } = (0,_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__.useConnection)();\n    const { publicKey, sendTransaction } = (0,_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__.useWallet)();\n    if (!connection) {\n        throw new Error(\"Solana connection not established\");\n    }\n    const getProvider = ()=>{\n        if (!publicKey) {\n            throw new Error(\"Wallet not connected\");\n        }\n        const provider = new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.AnchorProvider(connection, {\n            publicKey,\n            signTransaction: async (tx)=>{\n                try {\n                    // Set recent blockhash\n                    const latestBlockhash = await connection.getLatestBlockhash();\n                    tx.recentBlockhash = latestBlockhash.blockhash;\n                    tx.feePayer = publicKey;\n                    const signedTx = await sendTransaction(tx, connection);\n                    // Wait for transaction confirmation with timeout\n                    const confirmation = await Promise.race([\n                        connection.confirmTransaction({\n                            signature: signedTx,\n                            blockhash: latestBlockhash.blockhash,\n                            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight\n                        }),\n                        new Promise((_, reject)=>setTimeout(()=>reject(new Error(\"Transaction confirmation timeout\")), 30000))\n                    ]);\n                    if (confirmation instanceof Error) {\n                        throw confirmation;\n                    }\n                    return tx;\n                } catch (error) {\n                    console.error(\"Transaction signing failed:\", error);\n                    if (error instanceof Error) {\n                        throw new Error(\"Transaction signing failed: \".concat(error.message));\n                    }\n                    throw new Error(\"Transaction signing failed: Unknown error\");\n                }\n            },\n            signAllTransactions: async (txs)=>{\n                try {\n                    const latestBlockhash = await connection.getLatestBlockhash();\n                    const signedTxs = await Promise.all(txs.map(async (tx)=>{\n                        tx.recentBlockhash = latestBlockhash.blockhash;\n                        tx.feePayer = publicKey;\n                        await sendTransaction(tx, connection);\n                        return tx;\n                    }));\n                    return signedTxs;\n                } catch (error) {\n                    console.error(\"Transaction batch signing failed:\", error);\n                    throw new Error(\"Failed to sign transaction batch\");\n                }\n            }\n        }, {\n            commitment: \"confirmed\"\n        });\n        return provider;\n    };\n    const getProgram = ()=>{\n        const provider = getProvider();\n        return new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.Program(_types_gaming_challenge__WEBPACK_IMPORTED_MODULE_2__.IDL, PROGRAM_ID, provider);\n    };\n    const createChallenge = async (wagerAmount)=>{\n        try {\n            if (!publicKey) {\n                throw new Error(\"Wallet not connected\");\n            }\n            if (wagerAmount <= 0) {\n                throw new Error(\"Wager amount must be greater than 0\");\n            }\n            const program = getProgram();\n            const challenge = _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.Keypair.generate();\n            const lamports = wagerAmount * _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.web3.LAMPORTS_PER_SOL;\n            // Check if user has sufficient balance\n            const balance = await connection.getBalance(publicKey);\n            if (balance < lamports) {\n                throw new Error(\"Insufficient balance for wager amount\");\n            }\n            const statsHash = Array.from({\n                length: 32\n            }, ()=>Math.floor(Math.random() * 256));\n            const tx = await program.methods.createChallenge(new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.BN(lamports), statsHash).accounts({\n                challenge: challenge.publicKey,\n                creator: publicKey,\n                systemProgram: _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.SystemProgram.programId\n            }).signers([\n                challenge\n            ]).rpc();\n            return challenge.publicKey.toString();\n        } catch (error) {\n            console.error(\"Failed to create challenge:\", error);\n            if (error instanceof Error) {\n                throw new Error(\"Failed to create challenge: \".concat(error.message));\n            }\n            throw new Error(\"Failed to create challenge: Unknown error\");\n        }\n    };\n    const acceptChallenge = async (challengeId)=>{\n        try {\n            if (!challengeId) {\n                throw new Error(\"Challenge ID is required\");\n            }\n            const program = getProgram();\n            const challengePubkey = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(challengeId);\n            const tx = await program.methods.acceptChallenge().accounts({\n                challenge: challengePubkey,\n                challenger: publicKey,\n                systemProgram: _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.SystemProgram.programId\n            }).rpc();\n            await connection.confirmTransaction(tx, \"confirmed\");\n            return true;\n        } catch (error) {\n            console.error(\"Failed to accept challenge:\", error);\n            throw new Error(error instanceof Error ? error.message : \"Failed to accept challenge\");\n        }\n    };\n    const completeChallenge = async (challengeId, winner, stats)=>{\n        try {\n            if (!challengeId || !winner) {\n                throw new Error(\"Challenge ID and winner address are required\");\n            }\n            const program = getProgram();\n            const challengePubkey = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(challengeId);\n            const winnerPubkey = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(winner);\n            // In a real implementation, you would generate a proper ZK proof here\n            const zkProof = new Uint8Array(32); // Placeholder for actual ZK proof\n            const tx = await program.methods.completeChallenge(winnerPubkey, zkProof).accounts({\n                challenge: challengePubkey,\n                creator: publicKey,\n                challenger: winnerPubkey\n            }).rpc();\n            await connection.confirmTransaction(tx, \"confirmed\");\n            return true;\n        } catch (error) {\n            console.error(\"Failed to complete challenge:\", error);\n            throw new Error(error instanceof Error ? error.message : \"Failed to complete challenge\");\n        }\n    };\n    const getChallengeDetails = async (challengeId)=>{\n        try {\n            if (!challengeId) {\n                throw new Error(\"Challenge ID is required\");\n            }\n            const program = getProgram();\n            const challengePubkey = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(challengeId);\n            const account = await program.account.challenge.fetch(challengePubkey);\n            return {\n                creator: account.creator.toString(),\n                wagerAmount: account.wagerAmount.toNumber() / _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.web3.LAMPORTS_PER_SOL,\n                isComplete: account.isComplete,\n                challenger: account.challenger.equals(_solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey.default) ? null : account.challenger.toString(),\n                createdAt: new Date(account.createdAt.toNumber() * 1000)\n            };\n        } catch (error) {\n            console.error(\"Failed to fetch challenge details:\", error);\n            throw new Error(error instanceof Error ? error.message : \"Failed to fetch challenge details\");\n        }\n    };\n    return {\n        createChallenge,\n        acceptChallenge,\n        completeChallenge,\n        getChallengeDetails\n    };\n};\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VSxNQUFNbkMsUUFBUW1DLE9BQU8sQ0FBQ2xDLFNBQVMsQ0FBQ21DLEtBQUssQ0FBQ1Y7WUFFdEQsT0FBTztnQkFDTFIsU0FBU2lCLFFBQVFqQixPQUFPLENBQUNLLFFBQVE7Z0JBQ2pDeEIsYUFDRW9DLFFBQVFwQyxXQUFXLENBQUNzQyxRQUFRLEtBQUs1RSx1REFBVyxDQUFDNEMsZ0JBQWdCO2dCQUMvRGlDLFlBQVlILFFBQVFHLFVBQVU7Z0JBQzlCWCxZQUFZUSxRQUFRUixVQUFVLENBQUNZLE1BQU0sQ0FBQ2pGLHNEQUFTQSxDQUFDa0YsT0FBTyxJQUNuRCxPQUNBTCxRQUFRUixVQUFVLENBQUNKLFFBQVE7Z0JBQy9Ca0IsV0FBVyxJQUFJQyxLQUFLUCxRQUFRTSxTQUFTLENBQUNKLFFBQVEsS0FBSztZQUNyRDtRQUNGLEVBQUUsT0FBT2pELE9BQU87WUFDZEMsUUFBUUQsS0FBSyxDQUFDLHNDQUFzQ0E7WUFDcEQsTUFBTSxJQUFJcEIsTUFDUm9CLGlCQUFpQnBCLFFBQ2JvQixNQUFNRSxPQUFPLEdBQ2I7UUFFUjtJQUNGO0lBRUEsT0FBTztRQUNMUTtRQUNBMEI7UUFDQUk7UUFDQU07SUFDRjtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIi9ob21lL2RiL1Byb2plY3RzL0Jsb2NrY2hhaW4vYm91bnR5LWVhcm4vQ2F0b2ZmL0NhdG9mZl8wMS9mcm9udGVuZC9ob29rcy91c2VTb2xhbmFDaGFsbGVuZ2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gZnJvbnRlbmQvaG9va3MvdXNlU29sYW5hQ2hhbGxlbmdlLnRzXG5pbXBvcnQgeyB1c2VDb25uZWN0aW9uLCB1c2VXYWxsZXQgfSBmcm9tIFwiQHNvbGFuYS93YWxsZXQtYWRhcHRlci1yZWFjdFwiO1xuaW1wb3J0IHsgUHJvZ3JhbSwgQW5jaG9yUHJvdmlkZXIsIElkbCB9IGZyb20gXCJAcHJvamVjdC1zZXJ1bS9hbmNob3JcIjtcbmltcG9ydCB7XG4gIENvbm5lY3Rpb24sXG4gIFB1YmxpY0tleSxcbiAgU3lzdGVtUHJvZ3JhbSxcbiAgS2V5cGFpcixcbiAgVHJhbnNhY3Rpb25TaWduYXR1cmUsXG59IGZyb20gXCJAc29sYW5hL3dlYjMuanNcIjtcbmltcG9ydCAqIGFzIGFuY2hvciBmcm9tIFwiQHByb2plY3Qtc2VydW0vYW5jaG9yXCI7XG5pbXBvcnQgeyBJREwgfSBmcm9tIFwiLi4vdHlwZXMvZ2FtaW5nX2NoYWxsZW5nZVwiO1xuXG5jb25zdCBQUk9HUkFNX0lEID0gbmV3IFB1YmxpY0tleShcbiAgXCJHQlVaUDNmYUY1bThuY3RENk53b0M1WkNHTmJxOTVkMWc1M0x1UjdVOTdGU1wiXG4pO1xuXG5pbnRlcmZhY2UgR2FtZVN0YXRzIHtcbiAga2lsbHM6IG51bWJlcjtcbiAgZGVhdGhzOiBudW1iZXI7XG4gIGFzc2lzdHM6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIENoYWxsZW5nZURldGFpbHMge1xuICBjcmVhdG9yOiBzdHJpbmc7XG4gIHdhZ2VyQW1vdW50OiBudW1iZXI7XG4gIGlzQ29tcGxldGU6IGJvb2xlYW47XG4gIGNoYWxsZW5nZXI6IHN0cmluZyB8IG51bGw7XG4gIGNyZWF0ZWRBdDogRGF0ZTtcbn1cblxuZXhwb3J0IGNvbnN0IHVzZVNvbGFuYUNoYWxsZW5nZSA9ICgpID0+IHtcbiAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSB1c2VDb25uZWN0aW9uKCk7XG4gIGNvbnN0IHsgcHVibGljS2V5LCBzZW5kVHJhbnNhY3Rpb24gfSA9IHVzZVdhbGxldCgpO1xuXG4gIGlmICghY29ubmVjdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNvbGFuYSBjb25uZWN0aW9uIG5vdCBlc3RhYmxpc2hlZFwiKTtcbiAgfVxuXG4gIGNvbnN0IGdldFByb3ZpZGVyID0gKCkgPT4ge1xuICAgIGlmICghcHVibGljS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXYWxsZXQgbm90IGNvbm5lY3RlZFwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm92aWRlciA9IG5ldyBBbmNob3JQcm92aWRlcihcbiAgICAgIGNvbm5lY3Rpb24sXG4gICAgICB7XG4gICAgICAgIHB1YmxpY0tleSxcbiAgICAgICAgc2lnblRyYW5zYWN0aW9uOiBhc3luYyAodHgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gU2V0IHJlY2VudCBibG9ja2hhc2hcbiAgICAgICAgICAgIGNvbnN0IGxhdGVzdEJsb2NraGFzaCA9IGF3YWl0IGNvbm5lY3Rpb24uZ2V0TGF0ZXN0QmxvY2toYXNoKCk7XG4gICAgICAgICAgICB0eC5yZWNlbnRCbG9ja2hhc2ggPSBsYXRlc3RCbG9ja2hhc2guYmxvY2toYXNoO1xuICAgICAgICAgICAgdHguZmVlUGF5ZXIgPSBwdWJsaWNLZXk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNpZ25lZFR4ID0gYXdhaXQgc2VuZFRyYW5zYWN0aW9uKHR4LCBjb25uZWN0aW9uKTtcblxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdHJhbnNhY3Rpb24gY29uZmlybWF0aW9uIHdpdGggdGltZW91dFxuICAgICAgICAgICAgY29uc3QgY29uZmlybWF0aW9uID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgICAgICAgY29ubmVjdGlvbi5jb25maXJtVHJhbnNhY3Rpb24oe1xuICAgICAgICAgICAgICAgIHNpZ25hdHVyZTogc2lnbmVkVHgsXG4gICAgICAgICAgICAgICAgYmxvY2toYXNoOiBsYXRlc3RCbG9ja2hhc2guYmxvY2toYXNoLFxuICAgICAgICAgICAgICAgIGxhc3RWYWxpZEJsb2NrSGVpZ2h0OiBsYXRlc3RCbG9ja2hhc2gubGFzdFZhbGlkQmxvY2tIZWlnaHQsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBuZXcgUHJvbWlzZSgoXywgcmVqZWN0KSA9PlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoXG4gICAgICAgICAgICAgICAgICAoKSA9PiByZWplY3QobmV3IEVycm9yKFwiVHJhbnNhY3Rpb24gY29uZmlybWF0aW9uIHRpbWVvdXRcIikpLFxuICAgICAgICAgICAgICAgICAgMzAwMDBcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgaWYgKGNvbmZpcm1hdGlvbiBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgIHRocm93IGNvbmZpcm1hdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHR4O1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVHJhbnNhY3Rpb24gc2lnbmluZyBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVHJhbnNhY3Rpb24gc2lnbmluZyBmYWlsZWQ6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRyYW5zYWN0aW9uIHNpZ25pbmcgZmFpbGVkOiBVbmtub3duIGVycm9yXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2lnbkFsbFRyYW5zYWN0aW9uczogYXN5bmMgKHR4cykgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsYXRlc3RCbG9ja2hhc2ggPSBhd2FpdCBjb25uZWN0aW9uLmdldExhdGVzdEJsb2NraGFzaCgpO1xuICAgICAgICAgICAgY29uc3Qgc2lnbmVkVHhzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICAgIHR4cy5tYXAoYXN5bmMgKHR4KSA9PiB7XG4gICAgICAgICAgICAgICAgdHgucmVjZW50QmxvY2toYXNoID0gbGF0ZXN0QmxvY2toYXNoLmJsb2NraGFzaDtcbiAgICAgICAgICAgICAgICB0eC5mZWVQYXllciA9IHB1YmxpY0tleTtcbiAgICAgICAgICAgICAgICBhd2FpdCBzZW5kVHJhbnNhY3Rpb24odHgsIGNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0eDtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gc2lnbmVkVHhzO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVHJhbnNhY3Rpb24gYmF0Y2ggc2lnbmluZyBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBzaWduIHRyYW5zYWN0aW9uIGJhdGNoXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7IGNvbW1pdG1lbnQ6IFwiY29uZmlybWVkXCIgfVxuICAgICk7XG5cbiAgICByZXR1cm4gcHJvdmlkZXI7XG4gIH07XG5cbiAgY29uc3QgZ2V0UHJvZ3JhbSA9ICgpID0+IHtcbiAgICBjb25zdCBwcm92aWRlciA9IGdldFByb3ZpZGVyKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9ncmFtKElETCBhcyBJZGwsIFBST0dSQU1fSUQsIHByb3ZpZGVyKTtcbiAgfTtcblxuICBjb25zdCBjcmVhdGVDaGFsbGVuZ2UgPSBhc3luYyAod2FnZXJBbW91bnQ6IG51bWJlcik6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghcHVibGljS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIldhbGxldCBub3QgY29ubmVjdGVkXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAod2FnZXJBbW91bnQgPD0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXYWdlciBhbW91bnQgbXVzdCBiZSBncmVhdGVyIHRoYW4gMFwiKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJvZ3JhbSA9IGdldFByb2dyYW0oKTtcbiAgICAgIGNvbnN0IGNoYWxsZW5nZSA9IEtleXBhaXIuZ2VuZXJhdGUoKTtcbiAgICAgIGNvbnN0IGxhbXBvcnRzID0gd2FnZXJBbW91bnQgKiBhbmNob3Iud2ViMy5MQU1QT1JUU19QRVJfU09MO1xuXG4gICAgICAvLyBDaGVjayBpZiB1c2VyIGhhcyBzdWZmaWNpZW50IGJhbGFuY2VcbiAgICAgIGNvbnN0IGJhbGFuY2UgPSBhd2FpdCBjb25uZWN0aW9uLmdldEJhbGFuY2UocHVibGljS2V5KTtcbiAgICAgIGlmIChiYWxhbmNlIDwgbGFtcG9ydHMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW5zdWZmaWNpZW50IGJhbGFuY2UgZm9yIHdhZ2VyIGFtb3VudFwiKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3RhdHNIYXNoID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMzIgfSwgKCkgPT5cbiAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgdHggPSBhd2FpdCBwcm9ncmFtLm1ldGhvZHNcbiAgICAgICAgLmNyZWF0ZUNoYWxsZW5nZShuZXcgYW5jaG9yLkJOKGxhbXBvcnRzKSwgc3RhdHNIYXNoKVxuICAgICAgICAuYWNjb3VudHMoe1xuICAgICAgICAgIGNoYWxsZW5nZTogY2hhbGxlbmdlLnB1YmxpY0tleSxcbiAgICAgICAgICBjcmVhdG9yOiBwdWJsaWNLZXksXG4gICAgICAgICAgc3lzdGVtUHJvZ3JhbTogU3lzdGVtUHJvZ3JhbS5wcm9ncmFtSWQsXG4gICAgICAgIH0pXG4gICAgICAgIC5zaWduZXJzKFtjaGFsbGVuZ2VdKVxuICAgICAgICAucnBjKCk7XG5cbiAgICAgIHJldHVybiBjaGFsbGVuZ2UucHVibGljS2V5LnRvU3RyaW5nKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIGNoYWxsZW5nZTpcIiwgZXJyb3IpO1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gY3JlYXRlIGNoYWxsZW5nZTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBjaGFsbGVuZ2U6IFVua25vd24gZXJyb3JcIik7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGFjY2VwdENoYWxsZW5nZSA9IGFzeW5jIChjaGFsbGVuZ2VJZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghY2hhbGxlbmdlSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hhbGxlbmdlIElEIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwcm9ncmFtID0gZ2V0UHJvZ3JhbSgpO1xuICAgICAgY29uc3QgY2hhbGxlbmdlUHVia2V5ID0gbmV3IFB1YmxpY0tleShjaGFsbGVuZ2VJZCk7XG5cbiAgICAgIGNvbnN0IHR4ID0gYXdhaXQgcHJvZ3JhbS5tZXRob2RzXG4gICAgICAgIC5hY2NlcHRDaGFsbGVuZ2UoKVxuICAgICAgICAuYWNjb3VudHMoe1xuICAgICAgICAgIGNoYWxsZW5nZTogY2hhbGxlbmdlUHVia2V5LFxuICAgICAgICAgIGNoYWxsZW5nZXI6IHB1YmxpY0tleSEsXG4gICAgICAgICAgc3lzdGVtUHJvZ3JhbTogU3lzdGVtUHJvZ3JhbS5wcm9ncmFtSWQsXG4gICAgICAgIH0pXG4gICAgICAgIC5ycGMoKTtcblxuICAgICAgYXdhaXQgY29ubmVjdGlvbi5jb25maXJtVHJhbnNhY3Rpb24odHgsIFwiY29uZmlybWVkXCIpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gYWNjZXB0IGNoYWxsZW5nZTpcIiwgZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiRmFpbGVkIHRvIGFjY2VwdCBjaGFsbGVuZ2VcIlxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgY29tcGxldGVDaGFsbGVuZ2UgPSBhc3luYyAoXG4gICAgY2hhbGxlbmdlSWQ6IHN0cmluZyxcbiAgICB3aW5uZXI6IHN0cmluZyxcbiAgICBzdGF0czogR2FtZVN0YXRzXG4gICk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWNoYWxsZW5nZUlkIHx8ICF3aW5uZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hhbGxlbmdlIElEIGFuZCB3aW5uZXIgYWRkcmVzcyBhcmUgcmVxdWlyZWRcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByb2dyYW0gPSBnZXRQcm9ncmFtKCk7XG4gICAgICBjb25zdCBjaGFsbGVuZ2VQdWJrZXkgPSBuZXcgUHVibGljS2V5KGNoYWxsZW5nZUlkKTtcbiAgICAgIGNvbnN0IHdpbm5lclB1YmtleSA9IG5ldyBQdWJsaWNLZXkod2lubmVyKTtcblxuICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3Ugd291bGQgZ2VuZXJhdGUgYSBwcm9wZXIgWksgcHJvb2YgaGVyZVxuICAgICAgY29uc3QgemtQcm9vZiA9IG5ldyBVaW50OEFycmF5KDMyKTsgLy8gUGxhY2Vob2xkZXIgZm9yIGFjdHVhbCBaSyBwcm9vZlxuXG4gICAgICBjb25zdCB0eCA9IGF3YWl0IHByb2dyYW0ubWV0aG9kc1xuICAgICAgICAuY29tcGxldGVDaGFsbGVuZ2Uod2lubmVyUHVia2V5LCB6a1Byb29mKVxuICAgICAgICAuYWNjb3VudHMoe1xuICAgICAgICAgIGNoYWxsZW5nZTogY2hhbGxlbmdlUHVia2V5LFxuICAgICAgICAgIGNyZWF0b3I6IHB1YmxpY0tleSEsXG4gICAgICAgICAgY2hhbGxlbmdlcjogd2lubmVyUHVia2V5LFxuICAgICAgICB9KVxuICAgICAgICAucnBjKCk7XG5cbiAgICAgIGF3YWl0IGNvbm5lY3Rpb24uY29uZmlybVRyYW5zYWN0aW9uKHR4LCBcImNvbmZpcm1lZFwiKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNvbXBsZXRlIGNoYWxsZW5nZTpcIiwgZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiRmFpbGVkIHRvIGNvbXBsZXRlIGNoYWxsZW5nZVwiXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBnZXRDaGFsbGVuZ2VEZXRhaWxzID0gYXN5bmMgKFxuICAgIGNoYWxsZW5nZUlkOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxDaGFsbGVuZ2VEZXRhaWxzPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghY2hhbGxlbmdlSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hhbGxlbmdlIElEIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwcm9ncmFtID0gZ2V0UHJvZ3JhbSgpO1xuICAgICAgY29uc3QgY2hhbGxlbmdlUHVia2V5ID0gbmV3IFB1YmxpY0tleShjaGFsbGVuZ2VJZCk7XG4gICAgICBjb25zdCBhY2NvdW50ID0gYXdhaXQgcHJvZ3JhbS5hY2NvdW50LmNoYWxsZW5nZS5mZXRjaChjaGFsbGVuZ2VQdWJrZXkpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdG9yOiBhY2NvdW50LmNyZWF0b3IudG9TdHJpbmcoKSxcbiAgICAgICAgd2FnZXJBbW91bnQ6XG4gICAgICAgICAgYWNjb3VudC53YWdlckFtb3VudC50b051bWJlcigpIC8gYW5jaG9yLndlYjMuTEFNUE9SVFNfUEVSX1NPTCxcbiAgICAgICAgaXNDb21wbGV0ZTogYWNjb3VudC5pc0NvbXBsZXRlLFxuICAgICAgICBjaGFsbGVuZ2VyOiBhY2NvdW50LmNoYWxsZW5nZXIuZXF1YWxzKFB1YmxpY0tleS5kZWZhdWx0KVxuICAgICAgICAgID8gbnVsbFxuICAgICAgICAgIDogYWNjb3VudC5jaGFsbGVuZ2VyLnRvU3RyaW5nKCksXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoYWNjb3VudC5jcmVhdGVkQXQudG9OdW1iZXIoKSAqIDEwMDApLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCBjaGFsbGVuZ2UgZGV0YWlsczpcIiwgZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgPyBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgOiBcIkZhaWxlZCB0byBmZXRjaCBjaGFsbGVuZ2UgZGV0YWlsc1wiXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZUNoYWxsZW5nZSxcbiAgICBhY2NlcHRDaGFsbGVuZ2UsXG4gICAgY29tcGxldGVDaGFsbGVuZ2UsXG4gICAgZ2V0Q2hhbGxlbmdlRGV0YWlscyxcbiAgfTtcbn07XG4iXSwibmFtZXMiOlsidXNlQ29ubmVjdGlvbiIsInVzZVdhbGxldCIsIlByb2dyYW0iLCJBbmNob3JQcm92aWRlciIsIlB1YmxpY0tleSIsIlN5c3RlbVByb2dyYW0iLCJLZXlwYWlyIiwiYW5jaG9yIiwiSURMIiwiUFJPR1JBTV9JRCIsInVzZVNvbGFuYUNoYWxsZW5nZSIsImNvbm5lY3Rpb24iLCJwdWJsaWNLZXkiLCJzZW5kVHJhbnNhY3Rpb24iLCJFcnJvciIsImdldFByb3ZpZGVyIiwicHJvdmlkZXIiLCJzaWduVHJhbnNhY3Rpb24iLCJ0eCIsImxhdGVzdEJsb2NraGFzaCIsImdldExhdGVzdEJsb2NraGFzaCIsInJlY2VudEJsb2NraGFzaCIsImJsb2NraGFzaCIsImZlZVBheWVyIiwic2lnbmVkVHgiLCJjb25maXJtYXRpb24iLCJQcm9taXNlIiwicmFjZSIsImNvbmZpcm1UcmFuc2FjdGlvbiIsInNpZ25hdHVyZSIsImxhc3RWYWxpZEJsb2NrSGVpZ2h0IiwiXyIsInJlamVjdCIsInNldFRpbWVvdXQiLCJlcnJvciIsImNvbnNvbGUiLCJtZXNzYWdlIiwic2lnbkFsbFRyYW5zYWN0aW9ucyIsInR4cyIsInNpZ25lZFR4cyIsImFsbCIsIm1hcCIsImNvbW1pdG1lbnQiLCJnZXRQcm9ncmFtIiwiY3JlYXRlQ2hhbGxlbmdlIiwid2FnZXJBbW91bnQiLCJwcm9ncmFtIiwiY2hhbGxlbmdlIiwiZ2VuZXJhdGUiLCJsYW1wb3J0cyIsIndlYjMiLCJMQU1QT1JUU19QRVJfU09MIiwiYmFsYW5jZSIsImdldEJhbGFuY2UiLCJzdGF0c0hhc2giLCJBcnJheSIsImZyb20iLCJsZW5ndGgiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJtZXRob2RzIiwiQk4iLCJhY2NvdW50cyIsImNyZWF0b3IiLCJzeXN0ZW1Qcm9ncmFtIiwicHJvZ3JhbUlkIiwic2lnbmVycyIsInJwYyIsInRvU3RyaW5nIiwiYWNjZXB0Q2hhbGxlbmdlIiwiY2hhbGxlbmdlSWQiLCJjaGFsbGVuZ2VQdWJrZXkiLCJjaGFsbGVuZ2VyIiwiY29tcGxldGVDaGFsbGVuZ2UiLCJ3aW5uZXIiLCJzdGF0cyIsIndpbm5lclB1YmtleSIsInprUHJvb2YiLCJVaW50OEFycmF5IiwiZ2V0Q2hhbGxlbmdlRGV0YWlscyIsImFjY291bnQiLCJmZXRjaCIsInRvTnVtYmVyIiwiaXNDb21wbGV0ZSIsImVxdWFscyIsImRlZmF1bHQiLCJjcmVhdGVkQXQiLCJEYXRlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./hooks/useSolanaChallenge.ts\n"));

/***/ })

});