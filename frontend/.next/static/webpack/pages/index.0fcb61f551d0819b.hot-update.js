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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useSolanaChallenge: () => (/* binding */ useSolanaChallenge)\n/* harmony export */ });\n/* harmony import */ var _solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @solana/wallet-adapter-react */ \"../node_modules/@solana/wallet-adapter-react/lib/esm/index.js\");\n/* harmony import */ var _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @project-serum/anchor */ \"../node_modules/@project-serum/anchor/dist/browser/index.js\");\n/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @solana/web3.js */ \"../node_modules/@solana/web3.js/lib/index.browser.esm.js\");\n/* harmony import */ var _types_gaming_challenge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/gaming_challenge */ \"./types/gaming_challenge.ts\");\n// frontend/hooks/useSolanaChallenge.ts\n\n\n\n\n\nconst PROGRAM_ID = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(\"GBUZP3faF5m8nctD6NwoC5ZCGNbq95d1g53LuR7U97FS\");\nconst useSolanaChallenge = ()=>{\n    const { connection } = (0,_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__.useConnection)();\n    if (!connection) {\n        throw new Error(\"Connection not established\");\n    }\n    const { publicKey, sendTransaction } = (0,_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__.useWallet)();\n    const getProvider = ()=>{\n        if (!publicKey) {\n            throw new Error(\"Wallet not connected!\");\n        }\n        const provider = new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.AnchorProvider(connection, {\n            publicKey,\n            signTransaction: async (tx)=>{\n                try {\n                    const signature = await sendTransaction(tx, connection, {\n                        preflightCommitment: \"confirmed\"\n                    });\n                    await connection.confirmTransaction(signature, \"confirmed\");\n                    return tx;\n                } catch (error) {\n                    console.error(\"Transaction signing failed:\", error);\n                    throw new Error(\"Failed to sign transaction\");\n                }\n            },\n            signAllTransactions: undefined\n        }, {\n            commitment: \"confirmed\"\n        });\n        return provider;\n    };\n    const getProgram = ()=>{\n        const provider = getProvider();\n        return new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.Program(_types_gaming_challenge__WEBPACK_IMPORTED_MODULE_2__.IDL, PROGRAM_ID, provider);\n    };\n    const createChallenge = async (wagerAmount)=>{\n        try {\n            if (wagerAmount <= 0) {\n                throw new Error(\"Wager amount must be greater than 0\");\n            }\n            const program = getProgram();\n            const challenge = _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.Keypair.generate();\n            const lamports = wagerAmount * _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.web3.LAMPORTS_PER_SOL;\n            // Generate random stats hash (32 bytes)\n            const statsHash = Array.from({\n                length: 32\n            }, ()=>Math.floor(Math.random() * 256));\n            const tx = await program.methods.createChallenge(new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.BN(lamports), statsHash).accounts({\n                challenge: challenge.publicKey,\n                creator: publicKey,\n                systemProgram: _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.SystemProgram.programId\n            }).signers([\n                challenge\n            ]).rpc();\n            await connection.confirmTransaction(tx, \"confirmed\");\n            return challenge.publicKey.toString();\n        } catch (error) {\n            console.error(\"Failed to create challenge:\", error);\n            throw new Error(error instanceof Error ? error.message : \"Failed to create challenge\");\n        }\n    };\n    const acceptChallenge = async (challengeId)=>{\n        try {\n            if (!challengeId) {\n                throw new Error(\"Challenge ID is required\");\n            }\n            const program = getProgram();\n            const challengePubkey = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(challengeId);\n            const tx = await program.methods.acceptChallenge().accounts({\n                challenge: challengePubkey,\n                challenger: publicKey,\n                systemProgram: _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.SystemProgram.programId\n            }).rpc();\n            await connection.confirmTransaction(tx, \"confirmed\");\n            return true;\n        } catch (error) {\n            console.error(\"Failed to accept challenge:\", error);\n            throw new Error(error instanceof Error ? error.message : \"Failed to accept challenge\");\n        }\n    };\n    const completeChallenge = async (challengeId, winner, stats)=>{\n        try {\n            if (!challengeId || !winner) {\n                throw new Error(\"Challenge ID and winner address are required\");\n            }\n            const program = getProgram();\n            const challengePubkey = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(challengeId);\n            const winnerPubkey = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(winner);\n            // In a real implementation, you would generate a proper ZK proof here\n            const zkProof = new Uint8Array(32); // Placeholder for actual ZK proof\n            const tx = await program.methods.completeChallenge(winnerPubkey, zkProof).accounts({\n                challenge: challengePubkey,\n                creator: publicKey,\n                challenger: winnerPubkey\n            }).rpc();\n            await connection.confirmTransaction(tx, \"confirmed\");\n            return true;\n        } catch (error) {\n            console.error(\"Failed to complete challenge:\", error);\n            throw new Error(error instanceof Error ? error.message : \"Failed to complete challenge\");\n        }\n    };\n    const getChallengeDetails = async (challengeId)=>{\n        try {\n            if (!challengeId) {\n                throw new Error(\"Challenge ID is required\");\n            }\n            const program = getProgram();\n            const challengePubkey = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey(challengeId);\n            const account = await program.account.challenge.fetch(challengePubkey);\n            return {\n                creator: account.creator.toString(),\n                wagerAmount: account.wagerAmount.toNumber() / _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.web3.LAMPORTS_PER_SOL,\n                isComplete: account.isComplete,\n                challenger: account.challenger.equals(_solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.PublicKey.default) ? null : account.challenger.toString(),\n                createdAt: new Date(account.createdAt.toNumber() * 1000)\n            };\n        } catch (error) {\n            console.error(\"Failed to fetch challenge details:\", error);\n            throw new Error(error instanceof Error ? error.message : \"Failed to fetch challenge details\");\n        }\n    };\n    return {\n        createChallenge,\n        acceptChallenge,\n        completeChallenge,\n        getChallengeDetails\n    };\n};\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFTLENBQUNrQyxLQUFLLENBQUNWO1lBRXRELE9BQU87Z0JBQ0xULFNBQVNrQixRQUFRbEIsT0FBTyxDQUFDSyxRQUFRO2dCQUNqQ3RCLGFBQ0VtQyxRQUFRbkMsV0FBVyxDQUFDcUMsUUFBUSxLQUFLM0QsdURBQVcsQ0FBQzRCLGdCQUFnQjtnQkFDL0RnQyxZQUFZSCxRQUFRRyxVQUFVO2dCQUM5QlgsWUFBWVEsUUFBUVIsVUFBVSxDQUFDWSxNQUFNLENBQUNoRSxzREFBU0EsQ0FBQ2lFLE9BQU8sSUFDbkQsT0FDQUwsUUFBUVIsVUFBVSxDQUFDTCxRQUFRO2dCQUMvQm1CLFdBQVcsSUFBSUMsS0FBS1AsUUFBUU0sU0FBUyxDQUFDSixRQUFRLEtBQUs7WUFDckQ7UUFDRixFQUFFLE9BQU81QyxPQUFPO1lBQ2RDLFFBQVFELEtBQUssQ0FBQyxzQ0FBc0NBO1lBQ3BELE1BQU0sSUFBSVYsTUFDUlUsaUJBQWlCVixRQUNiVSxNQUFNOEIsT0FBTyxHQUNiO1FBRVI7SUFDRjtJQUVBLE9BQU87UUFDTHhCO1FBQ0F5QjtRQUNBSTtRQUNBTTtJQUNGO0FBQ0YsRUFBRSIsInNvdXJjZXMiOlsiL2hvbWUvZGIvUHJvamVjdHMvQmxvY2tjaGFpbi9ib3VudHktZWFybi9DYXRvZmYvQ2F0b2ZmXzAxL2Zyb250ZW5kL2hvb2tzL3VzZVNvbGFuYUNoYWxsZW5nZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBmcm9udGVuZC9ob29rcy91c2VTb2xhbmFDaGFsbGVuZ2UudHNcbmltcG9ydCB7IHVzZUNvbm5lY3Rpb24sIHVzZVdhbGxldCB9IGZyb20gXCJAc29sYW5hL3dhbGxldC1hZGFwdGVyLXJlYWN0XCI7XG5pbXBvcnQgeyBQcm9ncmFtLCBBbmNob3JQcm92aWRlciwgSWRsIH0gZnJvbSBcIkBwcm9qZWN0LXNlcnVtL2FuY2hvclwiO1xuaW1wb3J0IHtcbiAgQ29ubmVjdGlvbixcbiAgUHVibGljS2V5LFxuICBTeXN0ZW1Qcm9ncmFtLFxuICBLZXlwYWlyLFxuICBUcmFuc2FjdGlvblNpZ25hdHVyZSxcbn0gZnJvbSBcIkBzb2xhbmEvd2ViMy5qc1wiO1xuaW1wb3J0ICogYXMgYW5jaG9yIGZyb20gXCJAcHJvamVjdC1zZXJ1bS9hbmNob3JcIjtcbmltcG9ydCB7IElETCB9IGZyb20gXCIuLi90eXBlcy9nYW1pbmdfY2hhbGxlbmdlXCI7XG5cbmNvbnN0IFBST0dSQU1fSUQgPSBuZXcgUHVibGljS2V5KFxuICBcIkdCVVpQM2ZhRjVtOG5jdEQ2TndvQzVaQ0dOYnE5NWQxZzUzTHVSN1U5N0ZTXCJcbik7XG5cbmludGVyZmFjZSBHYW1lU3RhdHMge1xuICBraWxsczogbnVtYmVyO1xuICBkZWF0aHM6IG51bWJlcjtcbiAgYXNzaXN0czogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgQ2hhbGxlbmdlRGV0YWlscyB7XG4gIGNyZWF0b3I6IHN0cmluZztcbiAgd2FnZXJBbW91bnQ6IG51bWJlcjtcbiAgaXNDb21wbGV0ZTogYm9vbGVhbjtcbiAgY2hhbGxlbmdlcjogc3RyaW5nIHwgbnVsbDtcbiAgY3JlYXRlZEF0OiBEYXRlO1xufVxuXG5leHBvcnQgY29uc3QgdXNlU29sYW5hQ2hhbGxlbmdlID0gKCkgPT4ge1xuICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IHVzZUNvbm5lY3Rpb24oKTtcbiAgaWYgKCFjb25uZWN0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ29ubmVjdGlvbiBub3QgZXN0YWJsaXNoZWRcIik7XG4gIH1cbiAgY29uc3QgeyBwdWJsaWNLZXksIHNlbmRUcmFuc2FjdGlvbiB9ID0gdXNlV2FsbGV0KCk7XG5cbiAgY29uc3QgZ2V0UHJvdmlkZXIgPSAoKSA9PiB7XG4gICAgaWYgKCFwdWJsaWNLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIldhbGxldCBub3QgY29ubmVjdGVkIVwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm92aWRlciA9IG5ldyBBbmNob3JQcm92aWRlcihcbiAgICAgIGNvbm5lY3Rpb24sXG4gICAgICB7XG4gICAgICAgIHB1YmxpY0tleSxcbiAgICAgICAgc2lnblRyYW5zYWN0aW9uOiBhc3luYyAodHgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgc2VuZFRyYW5zYWN0aW9uKHR4LCBjb25uZWN0aW9uLCB7XG4gICAgICAgICAgICAgIHByZWZsaWdodENvbW1pdG1lbnQ6IFwiY29uZmlybWVkXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IGNvbm5lY3Rpb24uY29uZmlybVRyYW5zYWN0aW9uKHNpZ25hdHVyZSwgXCJjb25maXJtZWRcIik7XG4gICAgICAgICAgICByZXR1cm4gdHg7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUcmFuc2FjdGlvbiBzaWduaW5nIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHNpZ24gdHJhbnNhY3Rpb25cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzaWduQWxsVHJhbnNhY3Rpb25zOiB1bmRlZmluZWQgYXMgYW55LFxuICAgICAgfSxcbiAgICAgIHsgY29tbWl0bWVudDogXCJjb25maXJtZWRcIiB9XG4gICAgKTtcblxuICAgIHJldHVybiBwcm92aWRlcjtcbiAgfTtcblxuICBjb25zdCBnZXRQcm9ncmFtID0gKCkgPT4ge1xuICAgIGNvbnN0IHByb3ZpZGVyID0gZ2V0UHJvdmlkZXIoKTtcbiAgICByZXR1cm4gbmV3IFByb2dyYW0oSURMIGFzIElkbCwgUFJPR1JBTV9JRCwgcHJvdmlkZXIpO1xuICB9O1xuXG4gIGNvbnN0IGNyZWF0ZUNoYWxsZW5nZSA9IGFzeW5jICh3YWdlckFtb3VudDogbnVtYmVyKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKHdhZ2VyQW1vdW50IDw9IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2FnZXIgYW1vdW50IG11c3QgYmUgZ3JlYXRlciB0aGFuIDBcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByb2dyYW0gPSBnZXRQcm9ncmFtKCk7XG4gICAgICBjb25zdCBjaGFsbGVuZ2UgPSBLZXlwYWlyLmdlbmVyYXRlKCk7XG4gICAgICBjb25zdCBsYW1wb3J0cyA9IHdhZ2VyQW1vdW50ICogYW5jaG9yLndlYjMuTEFNUE9SVFNfUEVSX1NPTDtcblxuICAgICAgLy8gR2VuZXJhdGUgcmFuZG9tIHN0YXRzIGhhc2ggKDMyIGJ5dGVzKVxuICAgICAgY29uc3Qgc3RhdHNIYXNoID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMzIgfSwgKCkgPT5cbiAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KVxuICAgICAgKTtcblxuICAgICAgY29uc3QgdHggPSBhd2FpdCBwcm9ncmFtLm1ldGhvZHNcbiAgICAgICAgLmNyZWF0ZUNoYWxsZW5nZShuZXcgYW5jaG9yLkJOKGxhbXBvcnRzKSwgc3RhdHNIYXNoKVxuICAgICAgICAuYWNjb3VudHMoe1xuICAgICAgICAgIGNoYWxsZW5nZTogY2hhbGxlbmdlLnB1YmxpY0tleSxcbiAgICAgICAgICBjcmVhdG9yOiBwdWJsaWNLZXkhLFxuICAgICAgICAgIHN5c3RlbVByb2dyYW06IFN5c3RlbVByb2dyYW0ucHJvZ3JhbUlkLFxuICAgICAgICB9KVxuICAgICAgICAuc2lnbmVycyhbY2hhbGxlbmdlXSlcbiAgICAgICAgLnJwYygpO1xuXG4gICAgICBhd2FpdCBjb25uZWN0aW9uLmNvbmZpcm1UcmFuc2FjdGlvbih0eCwgXCJjb25maXJtZWRcIik7XG4gICAgICByZXR1cm4gY2hhbGxlbmdlLnB1YmxpY0tleS50b1N0cmluZygpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBjaGFsbGVuZ2U6XCIsIGVycm9yKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIkZhaWxlZCB0byBjcmVhdGUgY2hhbGxlbmdlXCJcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGFjY2VwdENoYWxsZW5nZSA9IGFzeW5jIChjaGFsbGVuZ2VJZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghY2hhbGxlbmdlSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hhbGxlbmdlIElEIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwcm9ncmFtID0gZ2V0UHJvZ3JhbSgpO1xuICAgICAgY29uc3QgY2hhbGxlbmdlUHVia2V5ID0gbmV3IFB1YmxpY0tleShjaGFsbGVuZ2VJZCk7XG5cbiAgICAgIGNvbnN0IHR4ID0gYXdhaXQgcHJvZ3JhbS5tZXRob2RzXG4gICAgICAgIC5hY2NlcHRDaGFsbGVuZ2UoKVxuICAgICAgICAuYWNjb3VudHMoe1xuICAgICAgICAgIGNoYWxsZW5nZTogY2hhbGxlbmdlUHVia2V5LFxuICAgICAgICAgIGNoYWxsZW5nZXI6IHB1YmxpY0tleSEsXG4gICAgICAgICAgc3lzdGVtUHJvZ3JhbTogU3lzdGVtUHJvZ3JhbS5wcm9ncmFtSWQsXG4gICAgICAgIH0pXG4gICAgICAgIC5ycGMoKTtcblxuICAgICAgYXdhaXQgY29ubmVjdGlvbi5jb25maXJtVHJhbnNhY3Rpb24odHgsIFwiY29uZmlybWVkXCIpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gYWNjZXB0IGNoYWxsZW5nZTpcIiwgZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiRmFpbGVkIHRvIGFjY2VwdCBjaGFsbGVuZ2VcIlxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgY29tcGxldGVDaGFsbGVuZ2UgPSBhc3luYyAoXG4gICAgY2hhbGxlbmdlSWQ6IHN0cmluZyxcbiAgICB3aW5uZXI6IHN0cmluZyxcbiAgICBzdGF0czogR2FtZVN0YXRzXG4gICk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWNoYWxsZW5nZUlkIHx8ICF3aW5uZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hhbGxlbmdlIElEIGFuZCB3aW5uZXIgYWRkcmVzcyBhcmUgcmVxdWlyZWRcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByb2dyYW0gPSBnZXRQcm9ncmFtKCk7XG4gICAgICBjb25zdCBjaGFsbGVuZ2VQdWJrZXkgPSBuZXcgUHVibGljS2V5KGNoYWxsZW5nZUlkKTtcbiAgICAgIGNvbnN0IHdpbm5lclB1YmtleSA9IG5ldyBQdWJsaWNLZXkod2lubmVyKTtcblxuICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3Ugd291bGQgZ2VuZXJhdGUgYSBwcm9wZXIgWksgcHJvb2YgaGVyZVxuICAgICAgY29uc3QgemtQcm9vZiA9IG5ldyBVaW50OEFycmF5KDMyKTsgLy8gUGxhY2Vob2xkZXIgZm9yIGFjdHVhbCBaSyBwcm9vZlxuXG4gICAgICBjb25zdCB0eCA9IGF3YWl0IHByb2dyYW0ubWV0aG9kc1xuICAgICAgICAuY29tcGxldGVDaGFsbGVuZ2Uod2lubmVyUHVia2V5LCB6a1Byb29mKVxuICAgICAgICAuYWNjb3VudHMoe1xuICAgICAgICAgIGNoYWxsZW5nZTogY2hhbGxlbmdlUHVia2V5LFxuICAgICAgICAgIGNyZWF0b3I6IHB1YmxpY0tleSEsXG4gICAgICAgICAgY2hhbGxlbmdlcjogd2lubmVyUHVia2V5LFxuICAgICAgICB9KVxuICAgICAgICAucnBjKCk7XG5cbiAgICAgIGF3YWl0IGNvbm5lY3Rpb24uY29uZmlybVRyYW5zYWN0aW9uKHR4LCBcImNvbmZpcm1lZFwiKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNvbXBsZXRlIGNoYWxsZW5nZTpcIiwgZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiRmFpbGVkIHRvIGNvbXBsZXRlIGNoYWxsZW5nZVwiXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBnZXRDaGFsbGVuZ2VEZXRhaWxzID0gYXN5bmMgKFxuICAgIGNoYWxsZW5nZUlkOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxDaGFsbGVuZ2VEZXRhaWxzPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghY2hhbGxlbmdlSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2hhbGxlbmdlIElEIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwcm9ncmFtID0gZ2V0UHJvZ3JhbSgpO1xuICAgICAgY29uc3QgY2hhbGxlbmdlUHVia2V5ID0gbmV3IFB1YmxpY0tleShjaGFsbGVuZ2VJZCk7XG4gICAgICBjb25zdCBhY2NvdW50ID0gYXdhaXQgcHJvZ3JhbS5hY2NvdW50LmNoYWxsZW5nZS5mZXRjaChjaGFsbGVuZ2VQdWJrZXkpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdG9yOiBhY2NvdW50LmNyZWF0b3IudG9TdHJpbmcoKSxcbiAgICAgICAgd2FnZXJBbW91bnQ6XG4gICAgICAgICAgYWNjb3VudC53YWdlckFtb3VudC50b051bWJlcigpIC8gYW5jaG9yLndlYjMuTEFNUE9SVFNfUEVSX1NPTCxcbiAgICAgICAgaXNDb21wbGV0ZTogYWNjb3VudC5pc0NvbXBsZXRlLFxuICAgICAgICBjaGFsbGVuZ2VyOiBhY2NvdW50LmNoYWxsZW5nZXIuZXF1YWxzKFB1YmxpY0tleS5kZWZhdWx0KVxuICAgICAgICAgID8gbnVsbFxuICAgICAgICAgIDogYWNjb3VudC5jaGFsbGVuZ2VyLnRvU3RyaW5nKCksXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoYWNjb3VudC5jcmVhdGVkQXQudG9OdW1iZXIoKSAqIDEwMDApLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCBjaGFsbGVuZ2UgZGV0YWlsczpcIiwgZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgPyBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgOiBcIkZhaWxlZCB0byBmZXRjaCBjaGFsbGVuZ2UgZGV0YWlsc1wiXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZUNoYWxsZW5nZSxcbiAgICBhY2NlcHRDaGFsbGVuZ2UsXG4gICAgY29tcGxldGVDaGFsbGVuZ2UsXG4gICAgZ2V0Q2hhbGxlbmdlRGV0YWlscyxcbiAgfTtcbn07XG4iXSwibmFtZXMiOlsidXNlQ29ubmVjdGlvbiIsInVzZVdhbGxldCIsIlByb2dyYW0iLCJBbmNob3JQcm92aWRlciIsIlB1YmxpY0tleSIsIlN5c3RlbVByb2dyYW0iLCJLZXlwYWlyIiwiYW5jaG9yIiwiSURMIiwiUFJPR1JBTV9JRCIsInVzZVNvbGFuYUNoYWxsZW5nZSIsImNvbm5lY3Rpb24iLCJFcnJvciIsInB1YmxpY0tleSIsInNlbmRUcmFuc2FjdGlvbiIsImdldFByb3ZpZGVyIiwicHJvdmlkZXIiLCJzaWduVHJhbnNhY3Rpb24iLCJ0eCIsInNpZ25hdHVyZSIsInByZWZsaWdodENvbW1pdG1lbnQiLCJjb25maXJtVHJhbnNhY3Rpb24iLCJlcnJvciIsImNvbnNvbGUiLCJzaWduQWxsVHJhbnNhY3Rpb25zIiwidW5kZWZpbmVkIiwiY29tbWl0bWVudCIsImdldFByb2dyYW0iLCJjcmVhdGVDaGFsbGVuZ2UiLCJ3YWdlckFtb3VudCIsInByb2dyYW0iLCJjaGFsbGVuZ2UiLCJnZW5lcmF0ZSIsImxhbXBvcnRzIiwid2ViMyIsIkxBTVBPUlRTX1BFUl9TT0wiLCJzdGF0c0hhc2giLCJBcnJheSIsImZyb20iLCJsZW5ndGgiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJtZXRob2RzIiwiQk4iLCJhY2NvdW50cyIsImNyZWF0b3IiLCJzeXN0ZW1Qcm9ncmFtIiwicHJvZ3JhbUlkIiwic2lnbmVycyIsInJwYyIsInRvU3RyaW5nIiwibWVzc2FnZSIsImFjY2VwdENoYWxsZW5nZSIsImNoYWxsZW5nZUlkIiwiY2hhbGxlbmdlUHVia2V5IiwiY2hhbGxlbmdlciIsImNvbXBsZXRlQ2hhbGxlbmdlIiwid2lubmVyIiwic3RhdHMiLCJ3aW5uZXJQdWJrZXkiLCJ6a1Byb29mIiwiVWludDhBcnJheSIsImdldENoYWxsZW5nZURldGFpbHMiLCJhY2NvdW50IiwiZmV0Y2giLCJ0b051bWJlciIsImlzQ29tcGxldGUiLCJlcXVhbHMiLCJkZWZhdWx0IiwiY3JlYXRlZEF0IiwiRGF0ZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./hooks/useSolanaChallenge.ts\n"));

/***/ })

});