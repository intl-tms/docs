# Managing Editors

For the IT department. No code on this page.

Editors change a website's texts directly on its pages, with the Intl TMS
browser extension. Who may do that is decided by you, in your organisation's
identity provider, with one role: **Editor**. Microsoft Entra ID is described
here; your website's developers set up the connection once.

## What to know first

- **Editors sign in with their work account**, on a sign-in page of the
  website that is only for Editors. It is separate from any login the website
  has for its customers: a customer account can never edit, even when the same
  person has both.
- **One role.** Someone with the Editor role may change the website's texts
  in every language. Someone without it may not.
- **A sign-in lasts at most 10 hours.** After that the Editor signs in again.
- **Changes reach a signed-in Editor within the hour.** The website checks each
  Editor's account and role with Microsoft at least every hour.

## Give someone the Editor role

1. In the Microsoft Entra admin center, open **Enterprise applications** and
   choose the website's application (your developers named it, for example
   "Example.com editing").
2. Open **Users and groups → Add user/group**.
3. Choose the people, or a group (assigning a group needs Microsoft Entra ID
   P1 or higher), choose the role **Editor**, and click **Assign**.

They can sign in and edit straight away.

## A translator from another company

People outside your organisation are added as **guest users**:

1. In the Microsoft Entra admin center, open **Users → New user → Invite
   external user**, and enter their e-mail address.
2. They accept the invitation from their e-mail.
3. Give them the Editor role as above.

They sign in with their own company's account (or the account they accepted
the invitation with); you never handle their password.

## Take the role away

Remove the person, or the group, from the application's **Users and groups**,
or disable their account. **Within the hour**, at the website's next check,
they can no longer read or save, and their pages are no longer marked for
editing. Anything they typed but did not save is not saved.

## When an hour is too long

For an incident, ask the website's developers or operators for the
**emergency stop**. It has two parts:

- **End one Editor's sessions now.** The person is signed out at once
  everywhere, in Storybook too. Also remove their role, or they can simply
  sign in again.
- **Switch all editing off.** Nobody can edit until it is switched on again.
  Visitors see the website as always.

Agree in advance who carries these out and how to reach them.

## What is recorded

The website's own systems may record who changed each text, with the
person's name and identifier from Microsoft. Intl TMS itself records nothing
and sends nothing anywhere. See [Privacy](/privacy).
