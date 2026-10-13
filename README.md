<div align="center">

<img src="logo.png" width="140" alt="browseML">

### browseML's personas — who it is, in as few tokens as it takes

</div>

A persona is what browseML is told before every question: who it is, and the facts it answers from (its FAQ is
answered by the model itself, from these). Every token of it is read on the visitor's own CPU before the first
answer — once, then kept in the browser — so a persona here is short, factual, and checked.

<table>
<tr>
<td width="33%" valign="top">

**Facts only**

What browseML is, where it runs, how it proves its answers. Nothing promised that is not there.

</td>
<td width="33%" valign="top">

**A budget**

At most about 600 tokens: a 2-core laptop reads about 5 a second, and this is read before the first word.

</td>
<td width="33%" valign="top">

**Checked**

`node validate.mjs`: the format (bankML `.persona` v1), the budget, and browseML's rules.

</td>
</tr>
</table>

## Personas

| persona | for | tokens |
|---|---|---|
| [`browseml.persona`](personas/browseml.persona) | browseML's page and its FAQ | about 330 |

## The format (bankML `.persona` v1)

```json
{
  "persona": "browseml",
  "name": "browseML",
  "kind": "engine",
  "opening": "browseML knows best. … (optional: the first words, shown when it is switched to)",
  "system_prompt": "You are browseML: … (the facts, short)",
  "behavioral_traits": ["optional", "list"],
  "awareness": { "facts": [{ "fact": "optional, sourced" }] }
}
```

The page reads `system_prompt` (and the optional traits and facts) into the field's `.persona` window; bankML's own
personas (its 10 KB `bankml.persona`, Savante's) follow the same format. `opening` is optional: the persona's first
words, shown when a visitor switches to it — never sent to the model.

**Make one in browseML:** the control panel's **PERSONA** switches between browseML's own and yours (new, edit,
import, export a `.persona`); **BUILDER → .persona** has browseML fill the name, the opening message and the prompt
from a description, on your computer, for you to read and edit.

```sh
node validate.mjs            # every personas/*.persona
node --test validate.test.mjs # the validator's own tests
```

Used by [browseML](https://github.com/browseML/browseML) (`web/browseml.persona`). Licence: `MIT OR Apache-2.0`.
