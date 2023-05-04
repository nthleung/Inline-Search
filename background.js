/**
 * background.js
 *
 * Use your favourite search engines on the fly
 * without having to open new tab.
 *
 * @author     Tsz Hin Leung
 * @copyright  Copyright (c) 2023
 * @license    MIT license
 */


console.log("Welcome to Inline Search")

function removeRulesFromTab(tabId){

    chrome.declarativeNetRequest.getSessionRules(
        function(rules){
            var ruleIdArray = rules.reduce(function(ruleIdArray, rule){
                if(rule.condition.tabIds[0] == tabId)
                    ruleIdArray.push(rule.id)
                return ruleIdArray
            }, [])

            chrome.declarativeNetRequest.updateSessionRules(
                {
                    removeRuleIds: ruleIdArray
                }
            )
        }
    )

}

chrome.runtime.onMessage.addListener(
    function(request, sender) {

        switch(request.operation){
            case "open":

                var ruleId = Math.floor(Math.random() * chrome.declarativeNetRequest.MAX_NUMBER_OF_DYNAMIC_AND_SESSION_RULES) + 1
                chrome.declarativeNetRequest.updateSessionRules(
                    {
                        addRules: [{
                            "id": ruleId,
                            "priority": 1,
                            "action": {
                                "type": "modifyHeaders",
                                "requestHeaders": [{
                                    "header": "User-Agent",
                                    "operation": "set",
                                    "value": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36"
                                }]
                            },
                            "condition": {
                                "tabIds": [sender.tab.id],
                                "urlFilter": "*://*/*",
                                "resourceTypes": ["sub_frame"]
                            }
                        }]
                    }
                )
                break;

            case "close":
                removeRulesFromTab(sender.tab.id)
                break;
        }

    }
);

chrome.tabs.onRemoved.addListener(
    function(tabId){
        removeRulesFromTab(tabId)
    }
)

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo){
        if (changeInfo.url)
            removeRulesFromTab(tabId)
    }
)
