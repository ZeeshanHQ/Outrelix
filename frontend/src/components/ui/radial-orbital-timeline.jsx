"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-material";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { motion, AnimatePresence } from "framer-motion";

export default function RadialOrbitalTimeline({
    timelineData,
}) {
    const [expandedItems, setExpandedItems] = useState({});
    const [viewMode, setViewMode] = useState("orbital");
    const [rotationAngle, setRotationAngle] = useState(0);
    const [autoRotate, setAutoRotate] = useState(true);
    const [pulseEffect, setPulseEffect] = useState({});
    const [activeNodeId, setActiveNodeId] = useState(null);
    const containerRef = useRef(null);
    const orbitRef = useRef(null);
    const nodeRefs = useRef({});

    const handleContainerClick = (e) => {
        if (e.target === containerRef.current || e.target === orbitRef.current) {
            setExpandedItems({});
            setActiveNodeId(null);
            setPulseEffect({});
            setAutoRotate(true);
        }
    };

    const toggleItem = (id) => {
        setExpandedItems((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((key) => {
                if (parseInt(key) !== id) {
                    newState[parseInt(key)] = false;
                }
            });

            newState[id] = !prev[id];

            if (!prev[id]) {
                setActiveNodeId(id);
                setAutoRotate(false);

                const relatedItems = getRelatedItems(id);
                const newPulseEffect = {};
                relatedItems.forEach((relId) => {
                    newPulseEffect[relId] = true;
                });
                setPulseEffect(newPulseEffect);
                centerViewOnNode(id);
            } else {
                setActiveNodeId(null);
                setAutoRotate(true);
                setPulseEffect({});
            }

            return newState;
        });
    };

    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            if (autoRotate && viewMode === "orbital") {
                setRotationAngle((prev) => (prev + 0.2) % 360);
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        if (autoRotate && viewMode === "orbital") {
            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [autoRotate, viewMode]);

    const centerViewOnNode = (nodeId) => {
        if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;
        const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
        const totalNodes = timelineData.length;
        const targetAngle = (nodeIndex / totalNodes) * 360;
        setRotationAngle(270 - targetAngle);
    };

    const calculateNodePosition = (index, total) => {
        const angle = ((index / total) * 360 + rotationAngle) % 360;
        const radius = 220;
        const radian = (angle * Math.PI) / 180;
        const x = radius * Math.cos(radian);
        const y = radius * Math.sin(radian);
        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        const opacity = Math.max(0.3, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
        return { x, y, angle, zIndex, opacity };
    };

    const getRelatedItems = (itemId) => {
        const currentItem = timelineData.find((item) => item.id === itemId);
        return currentItem ? currentItem.relatedIds : [];
    };

    return (
        <div
            className="w-full h-[700px] flex flex-col items-center justify-center bg-obsidian-950 overflow-hidden rounded-[3rem] border border-white/5 relative shadow-inner"
            ref={containerRef}
            onClick={handleContainerClick}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />
            
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
                <div
                    className="absolute w-full h-full flex items-center justify-center"
                    ref={orbitRef}
                    style={{ perspective: "1200px" }}
                >
                    {/* Central Core */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute w-32 h-32 rounded-full bg-obsidian-900 flex items-center justify-center z-10 shadow-[0_0_60px_rgba(59,130,246,0.1)] border border-white/10"
                    >
                        <div className="absolute w-40 h-40 rounded-full border border-blue-500/10 animate-ping opacity-30" />
                        <div className="absolute w-56 h-56 rounded-full border border-blue-500/5 animate-[ping_3s_infinite] opacity-20" />
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] absolute -bottom-12">System Core</span>
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center backdrop-blur-2xl">
                             <Zap className="w-8 h-8 text-blue-400" />
                        </div>
                    </motion.div>

                    {/* Orbit Ring */}
                    <div className="absolute w-[440px] h-[440px] rounded-full border border-white/5 border-dashed opacity-20" />

                    {timelineData.map((item, index) => {
                        const position = calculateNodePosition(index, timelineData.length);
                        const isExpanded = expandedItems[item.id];
                        const isPulsing = pulseEffect[item.id];
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.id}
                                ref={(el) => (nodeRefs.current[item.id] = el)}
                                className={`absolute cursor-pointer transition-all duration-700 ease-out`}
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px)`,
                                    zIndex: isExpanded ? 500 : position.zIndex,
                                    opacity: isExpanded ? 1 : position.opacity,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(item.id);
                                }}
                            >
                                {/* Energy Field */}
                                <div
                                    className={`absolute rounded-full -inset-4 ${isPulsing ? "animate-pulse duration-700" : ""}`}
                                    style={{
                                        background: `radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 70%)`,
                                    }}
                                />

                                {/* Node */}
                                <div
                                    className={`
                                        w-12 h-12 rounded-2xl flex items-center justify-center
                                        ${isExpanded ? "bg-white text-black scale-125 shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-obsidian-800/40 text-white/40 shadow-sm"}
                                        border border-white/10 transition-all duration-500 group
                                    `}
                                >
                                    <Icon size={20} />
                                </div>

                                {/* Label */}
                                <div
                                    className={`
                                        absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap
                                        text-[10px] font-bold tracking-widest uppercase
                                        transition-all duration-500
                                        ${isExpanded ? "opacity-0 translate-y-2" : "text-white/20"}
                                    `}
                                >
                                    {item.title}
                                </div>

                                {/* Details Card */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-20 left-1/2 -translate-x-1/2 w-80 z-[1000]"
                                        >
                                            <Card className="bg-obsidian-900/90 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden">
                                                <CardHeader className="p-6 pb-2">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] uppercase font-bold tracking-widest">
                                                            {item.status.replace('-', ' ')}
                                                        </Badge>
                                                        <span className="text-[10px] font-mono text-white/20">{item.date}</span>
                                                    </div>
                                                    <CardTitle className="text-lg text-white font-bold tracking-tight">
                                                        {item.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6 pt-2 space-y-6">
                                                    <p className="text-sm text-white/40 leading-relaxed font-medium">
                                                        {item.content}
                                                    </p>
                                                    <div className="pt-4 border-t border-white/5">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                                Efficiency
                                                            </span>
                                                            <span className="font-mono text-xs text-blue-400">{item.energy}%</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-obsidian-950 rounded-full overflow-hidden border border-white/5">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${item.energy}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
