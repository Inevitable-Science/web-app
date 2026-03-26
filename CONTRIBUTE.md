# Contributing

Before contributing, ensure you understand the following. It is suggested that you understand core concepts within [Revnets v5](https://docs.juicebox.money/) including simple things like what suckers are, how loans operate and how input currency is split among token holders. Furthermore, it is essential you understand the development ecosystem (*more specified below*) that we operate on top of.

---

### Development Ecosystem

When building this app, we built on top of systems provided by [Juicebox Protocol](https://juicebox.money) and [Revnets v5,](https://revnet.app) it is essential you understand the gist of these tools when contributing. These tools include:

 - [Bendystraw](https://bendystraw.xyz/) - Blockchain Indexer for the ecosystem.
 - `juice-sdk-core` and `juice-sdk-react` - Client based SDK's which provide types and on/off chain data to the client (src [here](https://github.com/Bananapus/juice-sdk-v4))

These tools are used in most components, however have been created to improve developer experience so it is best that you understand them before you start contributing.

---

### GraphQL and Codegen

We depend on the blockchain indexer Bendystraw, they provide us with a GQL API that returns the latest data they have indexed from the blockchain. When using bendystraw within the app you are required to create an endpoint/edit an endpoint within the `/graphql` folder, then run the command `yarn generate:gql` to generate types for that data.

---

### Small Notes

When contributing please:
- Try to create composable hooks over large components 
- Keep business logic out of UI components where possible  
- Reuse existing hooks from `juice-sdk-react` before creating new ones  
- Avoid duplicating GraphQL queries

Component File Names: PascalCase
Hook/Function File Names: camelCase

---

Note the project uses yarn as the package manager, we manage vulnerabilities/peer deps through the resolutions object. Important note below.
```json
"resolutions": {
	"example-pkg": "1.0.0", // vulnerable package
	...
	"example-pkg-2": "1.0.0", // another vulnerable package

	// 	NOTE: these packages resolve differences in peer deps
	// 	between gql-codegen and sentry, sentry breaks gql-codegen
	//	as its peer deps below are newer than the gql-codegen 
	//	peer deps (i think...)
	"strip-ansi": "6.0.1",
	"string-width": "4.2.3",
	"wrap-ansi": "7.0.0"
}
```

---

### Internal API's
This app also depends on other API's found on the Inevitable Science Github account, find the source code there. Please request further assistance on this topic from `@d2things` on discord.

---

For further support message `@d2things` on discord.
