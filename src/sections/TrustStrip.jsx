"use client";

import { motion } from "framer-motion";

const products = [
  { name: "Blumen", suffix: "OS", accentChar: "O", accent: "text-blue-400/80" },
  { name: "Blumen Workspace", accent: null },
  { name: "Blumen", suffix: ".Js", accent: "text-amber-400/80" },
  { name: "Blumen", suffix: ".Py", accent: "text-emerald-400/80" },
];

function renderSuffix(product) {
  if (!product.suffix) return null;
  if (product.accentChar) {
    return product.suffix.split("").map((char, idx) =>
      char === product.accentChar ? (
        <span key={idx} className={product.accent}>
          {char}
        </span>
      ) : (
        <span key={idx}>{char}</span>
      )
    );
  }
  return <span className={product.accent}>{product.suffix}</span>;
}
const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "2M+", label: "Meeting minutes" },
  { value: "50ms", label: "Avg latency" },
  { value: "140+", label: "Countries" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-white/5 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-zinc-500">
          Trusted by forward-thinking teams
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
          {products.map((product, i) => (
            <motion.span
              key={product.suffix ? `${product.name}${product.suffix}` : product.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-base font-semibold tracking-tight text-white/50 sm:text-lg"
            >
              {product.suffix ? (
                <>
                  {product.name}
                  {renderSuffix(product)}
                </>
              ) : (
                product.name
              )}
            </motion.span>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
