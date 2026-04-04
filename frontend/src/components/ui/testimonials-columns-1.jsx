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
                className="flex flex-col gap-8 pb-8 bg-transparent"
            >
                {[
                    ...new Array(2).fill(0).map((_, index) => (
                        <React.Fragment key={index}>
                            {props.testimonials.map(({ title, description, icon: Icon }, i) => (
                                <div
                                    className="p-10 rounded-[2.5rem] border border-white/5 bg-obsidian-800/10 backdrop-blur-xl hover:bg-obsidian-800/20 hover:border-white/10 transition-all duration-500 max-w-xs w-full group overflow-hidden relative shadow-2xl"
                                    key={i}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />
                                    
                                    <div className="w-16 h-16 rounded-2xl bg-obsidian-950 border border-white/5 flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-700 group-hover:border-blue-500/30">
                                        <Icon className="w-8 h-8 text-white/40 group-hover:text-blue-400 transition-colors duration-500" />
                                    </div>
                                    <div className="font-bold text-xl text-white tracking-tight leading-7 mb-4 group-hover:text-blue-400 transition-colors duration-500">{title}</div>
                                    <div className="text-base text-white/30 leading-relaxed font-medium transition-colors duration-500 group-hover:text-white/40">{description}</div>
                                    
                                    {/* Subtle Status Orb */}
                                    <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    )),
                ]}
            </motion.div>
        </div>
    );
};
