import React from "react";
import { motion } from "framer-motion";

export const TestimonialsColumn = (props) => {
    return (
        <div className={props.className}>
            <motion.div
                animate={{
                    translateY: "-50%",
                }}
                transition={{
                    duration: props.duration || 10,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-6 pb-6 bg-transparent"
            >
                {[
                    ...new Array(2).fill(0).map((_, index) => (
                        <React.Fragment key={index}>
                            {props.testimonials.map(({ title, description, icon: Icon }, i) => (
                                <div
                                    className="p-8 rounded-3xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:border-slate-300 transition-all duration-300 max-w-xs w-full group"
                                    key={i}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mb-6 shadow-sm border border-slate-200/50 group-hover:scale-110 transition-transform duration-500 group-hover:bg-blue-50 group-hover:border-blue-100">
                                        <Icon className="w-6 h-6 text-slate-700 group-hover:text-blue-600 transition-colors duration-300" />
                                    </div>
                                    <div className="font-bold text-lg text-slate-900 tracking-tight leading-6 mb-2">{title}</div>
                                    <div className="text-sm text-slate-500 leading-relaxed font-medium">{description}</div>
                                </div>
                            ))}
                        </React.Fragment>
                    )),
                ]}
            </motion.div>
        </div>
    );
};
