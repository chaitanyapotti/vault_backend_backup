Databases

1. isIssuer --::-- Done
2. getProjectDetails --::-- Done
3. setProjectDetails -- Database
4. Featured Projects --::-- Done
5. Upcoming projects -- startDate > now --::-- Done
6. Ended projects -- R3 endDate < now (run cronjob to check from blockchain everyday) --::-- Done
7. Active projects -- now >> start date && not ended --::-- Done

Blockchain

2. Current round - crowdsale - done
3. getCurrentRoundDetails - crowdsale -done
4. funds Collected till Date in current round - crowdsale - already in getCurrentRoundDetails -done
5. tokens sold till now in current round - crowdsale - already in getCurrentRoundDetails -done

6. kill consensus -pollfactory - done
7. Raised amount - pollfactory - done
8. tap Increment Poll Result - pollfactory - done
9. tap Increment poll details - pollfactory - done
10. tap amount current - pollfactory - done
11. kill poll start date - pollfactory - done
12. currentKillPollIndex - pollfactory - done
13. cap percent - pollfactory - done
14. my refund value - pollfactory - divide usertokenbalance/(r1+r2+r3) \* remaining balance - done
15. remaining balance - pollfactory - done
16. my vote weight in tap poll - done (as tokenbalance\*100 > cap ? cap : same)
17. Xfr details - pollfactory - done

18. has Membership from daico - daico membership - done

19. has Membership from Vault - vault membership - done

20. get token balance of user against an address - erc20Token - done
21. is user account frozen - erc20Token - done
22. get tokens under governance - erc20Token - done

23. is R3 completed - freezable token - done

External

18. Prices of tokens of R2 and above in ether and dollar
