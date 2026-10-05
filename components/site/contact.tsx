"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState } from "react";
import { sendMessage, type ContactState } from "@/app/actions";
import { Magnetic } from "@/components/fx/magnetic";
import { Reveal } from "@/components/fx/reveal";
import { CheckIcon, MailIcon, PhoneIcon, SOCIAL_ICONS } from "@/components/icons";
import type { SiteContent, Social } from "@/lib/content/schema";
import { container } from "./section";
import { socialHandle } from "./social-links";

const EASE = [0.22, 1, 0.36, 1] as const;

const field =
  "w-full rounded-[14px] border border-line bg-bg px-4 text-base font-medium text-ink placeholder:text-muted/70 outline-none transition-[border-color,box-shadow] duration-500 hover:border-line-strong focus:border-gold focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--gold)_16%,transparent)]";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <span id={`${id}-err`} className="text-[13px] font-medium text-[#e5866b]">
          {error}
        </span>
      )}
    </div>
  );
}

/** One line of the contact list: round icon on the left, the address or username on the right. */
function ContactRow({
  href,
  icon,
  label,
  external,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  label?: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="group/c flex min-h-11 items-center gap-3.5 text-base font-medium text-ink"
    >
      <span className="btn-ghost grid size-11 shrink-0 place-items-center rounded-full text-ink group-hover/c:border-line-strong group-hover/c:bg-surface-2">
        {icon}
      </span>
      <span className="min-w-0 break-all underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-500 group-hover/c:decoration-current">
        {children}
      </span>
    </a>
  );
}

/** A small burst of gold bits when the message is sent. */
function Burst() {
  const bits = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + (i % 3) * 0.2;
    const d = 90 + ((i * 37) % 70);
    return { x: Math.cos(a) * d, y: Math.sin(a) * d - 20, r: (i * 47) % 360, s: 5 + (i % 4) * 2 };
  });
  return (
    <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 120], opacity: [1, 1, 0], rotate: b.r * 3, scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], times: [0, 0.45, 1] }}
          className="absolute block rounded-[1.5px] bg-gold"
          style={{ width: b.s, height: b.s * (i % 2 ? 2.4 : 1) }}
        />
      ))}
    </div>
  );
}

export function Contact({ contact, socials }: { contact: SiteContent["contact"]; socials: Social[] }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });
  const tel = contact.phone.replace(/[^\d+]/g, "").replace(/^0/, "+62");

  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};

  const links = socials.filter((s) => s.url);
  const showSocials = contact.showSocials && links.length > 0;
  const hasDirect = !!(contact.email || contact.phone);

  const intro = (
    <>
      <h2 id="contact-title" className="text-[38px] leading-none font-extrabold tracking-[-0.035em] text-ink md:text-[56px]">
        {contact.heading}
      </h2>
      {contact.text && <p className="text-[15px] leading-[1.65] text-muted md:text-[17px]">{contact.text}</p>}
    </>
  );

  const direct = hasDirect && (
    <div className="flex flex-col gap-3.5">
      {contact.email && (
        <ContactRow href={`mailto:${contact.email}`} icon={<MailIcon size={18} />}>
          {contact.email}
        </ContactRow>
      )}
      {contact.phone && (
        <ContactRow href={`tel:${tel}`} icon={<PhoneIcon size={18} />}>
          {contact.phone}
        </ContactRow>
      )}
    </div>
  );

  const social = showSocials && (
    <div className="flex flex-col gap-3.5">
      {links.map((s) => {
        const Icon = SOCIAL_ICONS[s.platform];
        return (
          <ContactRow key={s.id} href={s.url} icon={<Icon size={18} />} label={s.label || undefined} external>
            {socialHandle(s)}
          </ContactRow>
        );
      })}
    </div>
  );

  // Without the form, the contact details take the form's place: a card on the right with
  // email & phone and the social accounts as two labelled groups.
  if (!contact.showForm) {
    const groups = [
      direct && { title: "Email & telepon", body: direct },
      social && { title: "Media sosial", body: social },
    ].filter((g) => !!g);
    return (
      <section
        id="contact"
        aria-labelledby="contact-title"
        className={`${container} grid grid-cols-1 items-start gap-10 py-20 md:grid-cols-[400px_minmax(0,1fr)] md:gap-20 md:pt-32 md:pb-36`}
      >
        <Reveal className="flex flex-col gap-5 md:gap-6">{intro}</Reveal>
        {groups.length > 0 && (
          <Reveal delay={0.1}>
            <div className="flex flex-col rounded-[22px] border border-line bg-surface p-5 md:rounded-[28px] md:p-10">
              {groups.map((g, i) => (
                <div
                  key={g.title}
                  className={`flex min-w-0 flex-col gap-4 md:gap-5 ${i > 0 ? "mt-7 border-t border-line pt-7 md:mt-8 md:pt-8" : ""}`}
                >
                  <h3 className="text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">{g.title}</h3>
                  {g.body}
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </section>
    );
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className={`${container} grid grid-cols-1 items-start gap-10 py-20 md:grid-cols-[400px_minmax(0,1fr)] md:gap-20 md:pt-32 md:pb-36`}
    >
      <Reveal className="flex flex-col gap-5 md:gap-6">
        {intro}
        {direct && <div className="mt-2 md:mt-4">{direct}</div>}
        {social && <div className={hasDirect ? "border-t border-line pt-6 md:pt-7" : "mt-2 md:mt-4"}>{social}</div>}
      </Reveal>

      <Reveal delay={0.1}>
        <div className="rounded-[22px] border border-line bg-surface md:rounded-[28px]">
          <form action={action} className="relative flex flex-col gap-5 p-5 md:p-10" noValidate>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field id="c-name" label="Name" error={err.name}>
                <input
                  id="c-name"
                  name="name"
                  defaultValue={v.name}
                  type="text"
                  autoComplete="name"
                  placeholder="Nama kamu"
                  required
                  aria-invalid={!!err.name}
                  aria-describedby={err.name ? "c-name-err" : undefined}
                  className={`${field} h-[52px]`}
                />
              </Field>
              <Field id="c-phone" label="Phone" error={err.phone}>
                <input
                  id="c-phone"
                  name="phone"
                  defaultValue={v.phone}
                  type="tel"
                  autoComplete="tel"
                  placeholder="08xx xxxx xxxx"
                  className={`${field} h-[52px]`}
                />
              </Field>
            </div>
            <Field id="c-email" label="Email" error={err.email}>
              <input
                id="c-email"
                name="email"
                defaultValue={v.email}
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                required
                aria-invalid={!!err.email}
                aria-describedby={err.email ? "c-email-err" : undefined}
                className={`${field} h-[52px]`}
              />
            </Field>
            <Field id="c-note" label="Note" error={err.note}>
              <textarea
                id="c-note"
                name="note"
                defaultValue={v.note}
                rows={5}
                placeholder="Ceritakan kebutuhanmu"
                required
                data-lenis-prevent
                aria-invalid={!!err.note}
                aria-describedby={err.note ? "c-note-err" : undefined}
                className={`${field} scroll-thin min-h-40 resize-y py-3.5 leading-[1.55]`}
              />
            </Field>
            {/* honeypot */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            <div className="relative">
              <Magnetic strength={0.12} className="w-full">
                <button
                  type="submit"
                  disabled={pending}
                  className="btn-gold h-14 w-full cursor-pointer rounded-full text-base font-bold disabled:cursor-wait disabled:opacity-80"
                >
                  {pending ? "Mengirim…" : "Send message"}
                </button>
              </Magnetic>
              <AnimatePresence>{state.status === "ok" && !pending && <Burst key={state.sentAt} />}</AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {state.message && !pending && (
                <motion.p
                  key={state.message + state.status}
                  role="status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className={`flex items-center gap-2 text-sm font-medium ${state.status === "ok" ? "text-gold-text" : "text-[#e5866b]"}`}
                >
                  {state.status === "ok" && <CheckIcon size={18} />}
                  {state.message}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
