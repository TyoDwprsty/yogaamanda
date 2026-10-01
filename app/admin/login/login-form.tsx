"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState } from "react";
import { login, type LoginState } from "../actions";
import { inputClass } from "@/components/admin/fields";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <div className="rounded-[28px] border border-line bg-surface">
      <form action={action} className="relative z-[4] flex flex-col gap-5 p-7 md:p-9">
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-semibold text-ink">
            Username
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            defaultValue={state.username}
            required
            autoFocus
            className={`${inputClass} h-[52px]`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`${inputClass} h-[52px]`}
          />
        </div>
        <AnimatePresence>
          {state.error && !pending && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium text-[#e5866b]"
            >
              {state.error}
            </motion.p>
          )}
        </AnimatePresence>
        <button
          type="submit"
          disabled={pending}
          className="btn-gold mt-1 h-14 cursor-pointer rounded-full text-base font-bold disabled:cursor-wait disabled:opacity-80"
        >
          {pending ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
