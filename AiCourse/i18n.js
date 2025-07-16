// i18next多语言配置
import i18next from 'https://cdn.jsdelivr.net/npm/i18next@23.7.16/+esm';
import { initReactI18next } from 'https://cdn.jsdelivr.net/npm/react-i18next@14.0.5/+esm';

// 语言资源
const resources = {
    en: {
        translation: {
            // 导航
            nav: {
                overview: "Course Overview",
                phase1: "Phase 1",
                phase2: "Phase 2",
                phase3: "Phase 3",
                tracks: "Hot Tracks",
                pricing: "Course Purchase"
            },
            
            // 英雄区域
            hero: {
                title: "AI YouTube Shorts",
                subtitle: "Monetization Guide",
                description: "From zero to YPP, master AI creation skills, start your YouTube monetization journey",
                buyNow: "Buy Now",
                viewTracks: "View Hot Tracks"
            },
            
            // 课程概览
            overview: {
                title: "Course Overview",
                description: "This course will take you from zero foundation to mastering YouTube Shorts creation and monetization skills, using AI tools for efficient content production, quickly reaching YPP requirements and achieving revenue",
                features: {
                    path: "Three-Phase Learning Path",
                    pathDesc: "From account preparation to content creation to monetization, complete coverage of YouTube Shorts operation process",
                    ai: "AI Creation Skills",
                    aiDesc: "Master AI tool usage methods, improve creation efficiency, reduce content production barriers, make creation simple",
                    monetization: "Monetization Guidance",
                    monetizationDesc: "Detailed explanation of YPP opening conditions and processes, as well as subsequent revenue acquisition and management, let your efforts be rewarded"
                },
                highlights: {
                    title: "Course Highlights",
                    item1: "Start from zero foundation, suitable for complete beginners",
                    item2: "Detailed explanation of AI tools in content creation",
                    item3: "Provide hot track analysis and benchmarking account analysis methods",
                    item4: "Full hands-on guidance, let you learn while practicing",
                    item5: "Provide resource packages and templates to accelerate your learning process"
                },
                duration: {
                    title: "Course Duration & Schedule",
                    total: "Total Duration",
                    totalValue: "About 16 days",
                    phase1: "Phase 1",
                    phase1Value: "About 2 days",
                    phase2: "Phase 2", 
                    phase2Value: "About 2 days",
                    phase3: "Phase 3",
                    phase3Value: "About 12 days"
                }
            },
            
            // 课程阶段
            phases: {
                phase1: {
                    title: "Phase 1",
                    subtitle: "Understand Platform, Prepare YouTube Account",
                    description: "About 2 days · Start from zero foundation, understand YouTube platform and monetization path, complete account registration and basic setup",
                    objectives: "Learning Objectives",
                    obj1: "Understand YouTube platform basic rules and main monetization methods",
                    obj2: "Clarify YPP opening conditions and thresholds",
                    obj3: "Successfully register and complete basic YouTube account setup",
                    lessons: {
                        lesson1: "Understand YouTube platform and main monetization paths",
                        lesson1Time: "About 1 hour",
                        lesson1Desc: "Deeply understand YouTube platform characteristics, user groups and main monetization methods, including ad revenue sharing, membership subscriptions, super chat and other revenue channels.",
                        lesson2: "Understand YPP opening rules and thresholds",
                        lesson2Time: "About 1 hour",
                        lesson2Desc: "Detailed interpretation of YouTube Partner Program (YPP) opening conditions, including hard indicators such as subscription numbers and viewing time, as well as content policy requirements.",
                        lesson3: "Prepare network tools, register YouTube account",
                        lesson3Time: "About 1 hour",
                        lesson3Desc: "Learn how to prepare necessary network tools, complete YouTube account registration process, understand registration process precautions, avoid account ban risks.",
                        lesson4: "Complete account basic setup, understand video publishing process",
                        lesson4Time: "About 1 hour",
                        lesson4Desc: "Learn how to improve YouTube account basic information, including avatar, description, channel classification, etc., while understanding video upload, editing, publishing and optimization process."
                    }
                },
                phase2: {
                    title: "Phase 2",
                    subtitle: "Determine Track, Master AI Creation Skills, Publish First Video",
                    description: "About 2 days · Determine content direction, learn AI creation skills, complete first Shorts video production and publishing",
                    objectives: "Learning Objectives",
                    obj1: "Understand AI Shorts hot tracks, determine content direction suitable for yourself",
                    obj2: "Master AI tools in video creation, learn to write effective prompts",
                    obj3: "Complete first AI-generated Shorts video and successfully publish",
                    lessons: {
                        lesson1: "Understand AI Shorts hot tracks, determine direction to work on",
                        lesson1Time: "About 2 hours",
                        lesson1Desc: "Analyze current hot content types on YouTube Shorts platform, especially AI-generated content hot tracks, combine personal interests and resources, determine content creation direction suitable for yourself.",
                        lesson2: "Learn AI prompt writing skills and content conception methods",
                        lesson2Time: "About 3 hours",
                        lesson2Desc: "Deeply learn how to write effective AI prompts, master content conception methods for different types, including script creation, visual design, music selection and other skills.",
                        lesson3: "Find benchmarking accounts in corresponding tracks and analyze",
                        lesson3Time: "About 3 hours",
                        lesson3Desc: "Learn how to find excellent benchmarking accounts in selected tracks, analyze their content characteristics, operation strategies, audience interaction methods, etc., extract experience that can be learned from.",
                        lesson4: "Use AI tools to create first Shorts video",
                        lesson4Time: "About 1 day",
                        lesson4Desc: "Comprehensively apply learned AI creation skills and benchmarking account analysis experience, complete first Shorts video production, including script generation, material creation, video editing and post-processing."
                    }
                },
                phase3: {
                    title: "Phase 3",
                    subtitle: "Continuous Optimization, Open YPP, Get Revenue",
                    description: "About 12 days · Establish content production process, continuously optimize video quality, reach YPP requirements and achieve revenue",
                    objectives: "Learning Objectives",
                    obj1: "Establish efficient AI content creation process, achieve stable video updates",
                    obj2: "Optimize video content, improve viewing completion rate and interaction rate",
                    obj3: "Reach YPP opening conditions, complete application process and start getting revenue",
                    lessons: {
                        lesson1: "Establish AI creation process, update 1-2 videos daily",
                        lesson1Time: "About 8 days",
                        lesson1Desc: "According to previously learned content, establish efficient AI creation process, including topic selection, script creation, material generation, video editing and other links, achieve stable daily updates of 1-2 high-quality videos.",
                        lesson2: "Optimize AI content quality, improve viewing completion rate",
                        lesson2Time: "About 3 days",
                        lesson2Desc: "Learn how to analyze video data, optimize content quality based on audience feedback, improve video viewing completion rate and interaction rate, master video title, cover and description optimization skills.",
                        lesson3: "Reach YPP opening conditions, complete opening",
                        lesson3Time: "About 1 hour",
                        lesson3Desc: "When channel reaches YPP opening conditions, learn how to apply for YouTube Partner Program, understand application process precautions, ensure smooth review.",
                        lesson4: "Understand bank card binding and payment process",
                        lesson4Time: "About 2 hours",
                        lesson4Desc: "Learn how to bind payment accounts in YouTube backend, understand payment methods and tax policies in different regions, master revenue query and withdrawal operation process."
                    }
                }
            },
            
            // 热门赛道
            tracks: {
                title: "Hot Tracks",
                subtitle: "Run Through Minimum MVP",
                description: "Hot AI Shorts track recommendations and analysis, help you quickly find content direction suitable for yourself",
                overview: {
                    title: "Project Overview",
                    description: "Understand YouTube platform characteristics, user groups and main content types, master AI application methods in video creation, validate content direction through minimum viable product (MVP), lay foundation for subsequent scale operation."
                },
                content: {
                    title: "Hands-on Content",
                    item1: "Account operation foundation and optimization strategies",
                    item2: "Determine content tracks and benchmarking account analysis",
                    item3: "AI content creation full process hands-on"
                },
                selection: {
                    title: "How to Determine Tracks to Work On",
                    analysis: {
                        title: "Analyze Platform Hot Content",
                        item1: "View hot videos on YouTube platform, understand current trends",
                        item2: "Reference previous AI navigation manuals, get historical data and experience summary",
                        item3: "Learn content positioning methods from top YouTube bloggers",
                        item4: "Adjust based on general positioning methods and personal advantages"
                    },
                    benchmarking: {
                        title: "Benchmarking Account Analysis",
                        item1: "Learn how to find suitable benchmarking accounts in selected tracks",
                        item2: "Master benchmarking account analysis and breakdown methods",
                        item3: "Understand which types of benchmarking channels are not suitable for imitation",
                        item4: "Learn to estimate potential revenue of YouTube channels"
                    }
                },
                recommendations: {
                    title: "2025 Hot AI Shorts Track Recommendations",
                    talent: {
                        title: "Talent Show Series",
                        description: "Realize various interesting talent show performances through AI technology, including transformation, curiosity, growth and other content."
                    },
                    animal: {
                        title: "Animal Related Series",
                        description: "Animal-themed content, including animal stories, animal rescue, animal warnings and other types."
                    },
                    squid: {
                        title: "Squid Game Related",
                        description: "Secondary creation content based on popular IP 'Squid Game', including various creative adaptations and derivative stories."
                    },
                    aiAnimal: {
                        title: "AI Animal Stories",
                        description: "Use AI to generate animal characters and storylines, create interesting animal-themed short films."
                    },
                    robot: {
                        title: "Beautiful Robot",
                        description: "Beautiful robot-themed content combining AI technology, including sci-fi, comedy and other styles."
                    },
                    cat: {
                        title: "Cat Stories",
                        description: "Use cats as characters to interpret alternative stories of real social contradictions, creative and deep."
                    }
                }
            },
            
            // 课程购买
            pricing: {
                title: "Choose Your Course",
                description: "We provide two course packages to meet different learning needs, help you quickly master YouTube Shorts monetization skills",
                basic: {
                    title: "Basic Course",
                    price: "$39.9",
                    description: "Suitable for zero foundation students",
                    features: {
                        item1: "Complete course graphic content",
                        item2: "Basic AI tool usage tutorials",
                        item3: "Account registration and setup guidance",
                        item4: "Basic content creation skills",
                        item5: "Learning material package download"
                    },
                    buyNow: "Buy Now"
                },
                vip: {
                    title: "VIP Course",
                    price: "$399",
                    description: "Suitable for students who want to monetize quickly",
                    badge: "Recommended",
                    features: {
                        item1: "Includes all basic course content",
                        item2: "Advanced AI tool deep application",
                        item3: "Customized content strategy",
                        item4: "YPP opening full guidance",
                        item5: "Monetization strategy deep analysis",
                        item6: "Lifetime learning support",
                        item7: "Priority customer service support"
                    },
                    buyNow: "Buy Now"
                }
            },
            
            // 行动召唤
            cta: {
                title: "Ready to Start Your YouTube Monetization Journey?",
                description: "Follow this course plan step by step, you will quickly master YouTube Shorts operation skills, use AI tools to achieve efficient content creation, and ultimately achieve video monetization goals.",
                startLearning: "Start Learning",
                saveCourse: "Save Course"
            },
            
            // 页脚
            footer: {
                description: "Use AI technology to start YouTube monetization journey, from zero foundation to monthly income over 10,000",
                sections: {
                    title: "Course Phases",
                    phase1: "Phase 1: Account Preparation",
                    phase2: "Phase 2: Content Creation",
                    phase3: "Phase 3: Monetization Revenue",
                    tracks: "Hot Track Recommendations"
                },
                resources: {
                    title: "Learning Resources",
                    tools: "AI Tools List",
                    templates: "Template Download",
                    faq: "FAQ",
                    community: "Learning Community"
                },
                contact: {
                    title: "Contact Us",
                    telegram: "Telegram: cnjs01",
                    discord: "Discord: liushentong_07233",
                    instagram: "Instagram: mbti536"
                },
                copyright: "© 2025 YouTube Shorts Course. All rights reserved.",
                legal: {
                    privacy: "Privacy Policy",
                    terms: "Terms of Service",
                    cookies: "Cookie Policy"
                }
            }
        }
    },
    
    ar: {
        translation: {
            // 阿拉伯语翻译
            nav: {
                overview: "نظرة عامة على الدورة",
                phase1: "المرحلة الأولى",
                phase2: "المرحلة الثانية",
                phase3: "المرحلة الثالثة",
                tracks: "المسارات الساخنة",
                pricing: "شراء الدورة"
            },
            hero: {
                title: "يوتيوب شورتس بالذكاء الاصطناعي",
                subtitle: "دليل الربح",
                description: "من الصفر إلى YPP، أتقن مهارات الإبداع بالذكاء الاصطناعي، ابدأ رحلة الربح من يوتيوب",
                buyNow: "اشتر الآن",
                viewTracks: "عرض المسارات الساخنة"
            },
            pricing: {
                title: "اختر دورتك",
                description: "نقدم حزمتين للدورات لتلبية احتياجات التعلم المختلفة، نساعدك على إتقان مهارات الربح من يوتيوب شورتس بسرعة",
                basic: {
                    title: "الدورة الأساسية",
                    price: "$39.9",
                    description: "مناسبة للطلاب المبتدئين",
                    buyNow: "اشتر الآن"
                },
                vip: {
                    title: "دورة VIP",
                    price: "$399",
                    description: "مناسبة للطلاب الذين يريدون الربح بسرعة",
                    badge: "موصى به",
                    buyNow: "اشتر الآن"
                }
            }
        }
    },
    
    id: {
        translation: {
            // 印尼语翻译
            nav: {
                overview: "Ikhtisar Kursus",
                phase1: "Fase 1",
                phase2: "Fase 2",
                phase3: "Fase 3",
                tracks: "Jalur Populer",
                pricing: "Pembelian Kursus"
            },
            hero: {
                title: "YouTube Shorts AI",
                subtitle: "Panduan Monetisasi",
                description: "Dari nol ke YPP, kuasai keterampilan kreasi AI, mulai perjalanan monetisasi YouTube Anda",
                buyNow: "Beli Sekarang",
                viewTracks: "Lihat Jalur Populer"
            },
            pricing: {
                title: "Pilih Kursus Anda",
                description: "Kami menyediakan dua paket kursus untuk memenuhi kebutuhan belajar yang berbeda, membantu Anda menguasai keterampilan monetisasi YouTube Shorts dengan cepat",
                basic: {
                    title: "Kursus Dasar",
                    price: "$39.9",
                    description: "Cocok untuk siswa pemula",
                    buyNow: "Beli Sekarang"
                },
                vip: {
                    title: "Kursus VIP",
                    price: "$399",
                    description: "Cocok untuk siswa yang ingin monetisasi dengan cepat",
                    badge: "Direkomendasikan",
                    buyNow: "Beli Sekarang"
                }
            }
        }
    },
    
    fr: {
        translation: {
            // 法语翻译
            nav: {
                overview: "Aperçu du Cours",
                phase1: "Phase 1",
                phase2: "Phase 2",
                phase3: "Phase 3",
                tracks: "Voies Populaires",
                pricing: "Achat de Cours"
            },
            hero: {
                title: "YouTube Shorts IA",
                subtitle: "Guide de Monétisation",
                description: "De zéro à YPP, maîtrisez les compétences de création IA, commencez votre voyage de monétisation YouTube",
                buyNow: "Acheter Maintenant",
                viewTracks: "Voir les Voies Populaires"
            },
            pricing: {
                title: "Choisissez Votre Cours",
                description: "Nous proposons deux packages de cours pour répondre aux différents besoins d'apprentissage, vous aider à maîtriser rapidement les compétences de monétisation YouTube Shorts",
                basic: {
                    title: "Cours de Base",
                    price: "$39.9",
                    description: "Convient aux étudiants débutants",
                    buyNow: "Acheter Maintenant"
                },
                vip: {
                    title: "Cours VIP",
                    price: "$399",
                    description: "Convient aux étudiants qui veulent monétiser rapidement",
                    badge: "Recommandé",
                    buyNow: "Acheter Maintenant"
                }
            }
        }
    },
    
    ru: {
        translation: {
            // 俄语翻译
            nav: {
                overview: "Обзор Курса",
                phase1: "Фаза 1",
                phase2: "Фаза 2",
                phase3: "Фаза 3",
                tracks: "Популярные Направления",
                pricing: "Покупка Курса"
            },
            hero: {
                title: "YouTube Shorts ИИ",
                subtitle: "Руководство по Монетизации",
                description: "От нуля до YPP, овладейте навыками создания ИИ, начните свой путь монетизации YouTube",
                buyNow: "Купить Сейчас",
                viewTracks: "Посмотреть Популярные Направления"
            },
            pricing: {
                title: "Выберите Ваш Курс",
                description: "Мы предлагаем два пакета курсов для удовлетворения различных потребностей в обучении, поможем вам быстро освоить навыки монетизации YouTube Shorts",
                basic: {
                    title: "Базовый Курс",
                    price: "$39.9",
                    description: "Подходит для начинающих студентов",
                    buyNow: "Купить Сейчас"
                },
                vip: {
                    title: "VIP Курс",
                    price: "$399",
                    description: "Подходит для студентов, которые хотят быстро монетизировать",
                    badge: "Рекомендуется",
                    buyNow: "Купить Сейчас"
                }
            }
        }
    },

    zh: {
        translation: {
            nav: {
                overview: "课程概览",
                phase1: "第一阶段",
                phase2: "第二阶段",
                phase3: "第三阶段",
                tracks: "热门赛道",
                pricing: "课程购买"
            },
            hero: {
                title: "AI创作YouTube Shorts",
                subtitle: "变现指南",
                description: "从零基础到开通YPP，掌握AI创作技巧，开启YouTube变现之旅",
                buyNow: "立即购买",
                viewTracks: "查看热门赛道"
            },
            overview: {
                title: "课程概览",
                description: "本课程将带你从零基础开始，一步步掌握YouTube Shorts的创作与变现技巧，利用AI工具高效产出内容，快速达到YPP要求并实现收益",
                features: {
                    path: "三阶段学习路径",
                    pathDesc: "从账号准备到内容创作，再到变现，完整覆盖YouTube Shorts运营全流程",
                    ai: "AI创作技巧",
                    aiDesc: "掌握AI工具使用方法，提升创作效率，降低内容生产门槛，让创作变得简单",
                    monetization: "变现指导",
                    monetizationDesc: "详细讲解YPP开通条件与流程，以及后续的收益获取与管理，让你的努力得到回报"
                },
                highlights: {
                    title: "课程亮点",
                    item1: "从零基础开始，适合完全没有经验的新手",
                    item2: "详细讲解AI工具在内容创作中的应用",
                    item3: "提供热门赛道分析与对标账号拆解方法",
                    item4: "全程实操指导，让你边学边练",
                    item5: "提供资源包与模板，加速你的学习过程"
                },
                duration: {
                    title: "课程时长与安排",
                    total: "总时长",
                    totalValue: "约16天",
                    phase1: "第一阶段",
                    phase1Value: "约2天",
                    phase2: "第二阶段",
                    phase2Value: "约2天",
                    phase3: "第三阶段",
                    phase3Value: "约12天"
                }
            },
            phases: {
                phase1: {
                    title: "第一阶段",
                    subtitle: "了解平台，准备YouTube账号",
                    description: "约2天 · 从零基础开始，了解YouTube平台与变现路径，完成账号注册与基础设置",
                    objectives: "学习目标",
                    obj1: "了解YouTube平台的基本规则与主要变现方式",
                    obj2: "明确YPP开通条件与门槛",
                    obj3: "成功注册并完成YouTube账号的基础设置",
                    lessons: {
                        lesson1: "了解YouTube平台以及主要变现路径",
                        lesson1Time: "约1小时",
                        lesson1Desc: "深入了解YouTube平台的特点、用户群体以及主要的变现方式，包括广告分成、会员订阅、超级聊天等多种收益渠道。",
                        lesson2: "了解YPP开通规则与门槛",
                        lesson2Time: "约1小时",
                        lesson2Desc: "详细解读YouTube Partner Program (YPP) 的开通条件，包括订阅数、观看时长等硬性指标，以及内容政策方面的要求。",
                        lesson3: "准备网络工具，注册YouTube账号",
                        lesson3Time: "约1小时",
                        lesson3Desc: "学习如何准备必要的网络工具，完成YouTube账号的注册过程，了解注册过程中的注意事项，避免账号被封的风险。",
                        lesson4: "完成账号基础设置，了解视频发布流程",
                        lesson4Time: "约1小时",
                        lesson4Desc: "学习如何完善YouTube账号的基本信息，包括头像、简介、频道分类等，同时了解视频的上传、编辑、发布以及优化流程。"
                    }
                },
                phase2: {
                    title: "第二阶段",
                    subtitle: "确定赛道，掌握AI创作技巧，发布首个视频",
                    description: "约2天 · 确定内容方向，学习AI创作技巧，完成第一个Shorts视频的制作与发布",
                    objectives: "学习目标",
                    obj1: "了解AI Shorts热门赛道，确定适合自己的内容方向",
                    obj2: "掌握AI工具在视频创作中的应用，学会编写有效的提示词",
                    obj3: "完成第一个AI生成的Shorts视频并成功发布",
                    lessons: {
                        lesson1: "了解AI Shorts热门赛道，确定要做的方向",
                        lesson1Time: "约2小时",
                        lesson1Desc: "分析当前YouTube Shorts平台上的热门内容类型，特别是AI生成内容的热门赛道，结合自身兴趣与资源，确定适合自己的内容创作方向。",
                        lesson2: "学习AI提示词编写技巧与内容构思方法",
                        lesson2Time: "约3小时",
                        lesson2Desc: "深入学习如何编写有效的AI提示词，掌握不同类型内容的构思方法，包括脚本创作、画面设计、音乐选择等方面的技巧。",
                        lesson3: "在对应赛道找到对标账号并进行分析",
                        lesson3Time: "约3小时",
                        lesson3Desc: "学习如何在选定的赛道中找到优秀的对标账号，分析他们的内容特点、运营策略、观众互动方式等，提炼出可借鉴的经验。",
                        lesson4: "使用AI工具创作第一个Shorts视频",
                        lesson4Time: "约1天",
                        lesson4Desc: "综合运用所学的AI创作技巧和对标账号分析经验，完成第一个Shorts视频的制作，包括脚本生成、素材创作、视频剪辑和后期处理等环节。"
                    }
                },
                phase3: {
                    title: "第三阶段",
                    subtitle: "持续优化，开通YPP，获取收益",
                    description: "约12天 · 建立内容生产流程，持续优化视频质量，达到YPP要求并实现收益",
                    objectives: "学习目标",
                    obj1: "建立高效的AI内容创作流程，实现稳定的视频更新",
                    obj2: "优化视频内容，提升观看完成率和互动率",
                    obj3: "达到YPP开通条件，完成申请流程并开始获取收益",
                    lessons: {
                        lesson1: "建立AI创作流程，每天更新1～2个视频",
                        lesson1Time: "约8天",
                        lesson1Desc: "根据之前学习的内容，建立一套高效的AI创作流程，包括选题、脚本创作、素材生成、视频剪辑等环节，实现每天稳定更新1-2个高质量视频。",
                        lesson2: "优化AI内容质量，提升观看完成率",
                        lesson2Time: "约3天",
                        lesson2Desc: "学习如何分析视频数据，根据观众反馈优化内容质量，提升视频的观看完成率和互动率，掌握视频标题、封面和描述的优化技巧。",
                        lesson3: "达到YPP开通条件后，完成开通",
                        lesson3Time: "约1小时",
                        lesson3Desc: "当频道达到YPP开通条件后，学习如何申请加入YouTube Partner Program，了解申请流程中的注意事项，确保顺利通过审核。",
                        lesson4: "了解银行卡绑定与回款流程",
                        lesson4Time: "约2小时",
                        lesson4Desc: "学习如何在YouTube后台绑定收款账户，了解不同地区的收款方式和税务政策，掌握收益查询和提现的操作流程。"
                    }
                }
            },
            tracks: {
                title: "热门赛道",
                subtitle: "跑通最小MVP",
                description: "热门AI Shorts赛道推荐与分析，助你快速找到适合自己的内容方向",
                overview: {
                    title: "项目概述",
                    description: "了解YouTube平台特点、用户群体以及主要的内容类型，掌握AI在视频创作中的应用方法，通过最小化可行产品(MVP)验证内容方向，为后续规模化运营打下基础。"
                },
                content: {
                    title: "实操内容",
                    item1: "账号运营基础与优化策略",
                    item2: "确定内容赛道与对标账号分析",
                    item3: "AI内容创作全流程实操"
                },
                selection: {
                    title: "如何确定要做的赛道",
                    analysis: {
                        title: "分析平台热门内容",
                        item1: "查看YouTube平台上的热门视频，了解当前流行趋势",
                        item2: "参考往期AI航海的手册，获取历史数据和经验总结",
                        item3: "学习头部YouTube博主的内容定位方法",
                        item4: "根据通用定位方法，结合自身优势进行调整"
                    },
                    benchmarking: {
                        title: "对标账号分析",
                        item1: "学习如何在所选赛道下找到合适的对标账号",
                        item2: "掌握对标账号的分析拆解方法",
                        item3: "了解哪些类型的对标频道不适合模仿",
                        item4: "学会估算YouTube频道的潜在收益"
                    }
                },
                recommendations: {
                    title: "2025热门AI Shorts赛道推荐",
                    talent: {
                        title: "达人秀系列",
                        description: "通过AI技术实现各种有趣的达人秀表演，包括变身、猎奇、成长类等内容。"
                    },
                    animal: {
                        title: "动物相关系列",
                        description: "以动物为主题的内容，包括动物故事、动物救援、动物示警等类型。"
                    },
                    squid: {
                        title: "鱿鱼游戏相关",
                        description: "基于热门IP'鱿鱼游戏'的二次创作内容，包括各种创意改编和衍生故事。"
                    },
                    aiAnimal: {
                        title: "AI动物故事类",
                        description: "利用AI生成动物角色和故事情节，打造有趣的动物主题短片。"
                    },
                    robot: {
                        title: "美女机器人",
                        description: "结合AI技术创作的美女机器人主题内容，包括科幻、搞笑等不同风格。"
                    },
                    cat: {
                        title: "猫咪故事",
                        description: "以猫咪为角色，演绎现实社会矛盾的另类故事，富有创意和深度。"
                    }
                }
            },
            pricing: {
                title: "选择适合您的课程",
                description: "我们提供两种课程套餐，满足不同学习需求，助您快速掌握YouTube Shorts变现技巧",
                basic: {
                    title: "基础课程",
                    price: "$39.9",
                    description: "适合零基础学员",
                    features: {
                        item1: "完整的课程图文内容",
                        item2: "基础AI工具使用教程",
                        item3: "账号注册与设置指导",
                        item4: "基础内容创作技巧",
                        item5: "学习资料包下载"
                    },
                    buyNow: "立即购买"
                },
                vip: {
                    title: "VIP课程",
                    price: "$399",
                    description: "适合想要快速变现的学员",
                    badge: "推荐",
                    features: {
                        item1: "包含基础课程全部内容",
                        item2: "高级AI工具深度应用",
                        item3: "定制化内容策略",
                        item4: "YPP开通全程指导",
                        item5: "变现策略深度解析",
                        item6: "终身学习支持",
                        item7: "优先客服支持"
                    },
                    buyNow: "立即购买"
                }
            },
            cta: {
                title: "准备好开始你的YouTube变现之旅了吗？",
                description: "按照这个课程计划，一步步操作，你将快速掌握YouTube Shorts的运营技巧，利用AI工具实现内容创作的高效化，最终实现视频变现的目标。",
                startLearning: "开始学习",
                saveCourse: "保存课程"
            },
            footer: {
                description: "用AI技术开启YouTube变现之旅，从零基础到月入过万",
                sections: {
                    title: "课程阶段",
                    phase1: "第一阶段：账号准备",
                    phase2: "第二阶段：内容创作",
                    phase3: "第三阶段：变现收益",
                    tracks: "热门赛道推荐"
                },
                resources: {
                    title: "学习资源",
                    tools: "AI工具清单",
                    templates: "模板下载",
                    faq: "常见问题",
                    community: "学习社群"
                },
                contact: {
                    title: "联系我们",
                    telegram: "Telegram：cnjs01",
                    discord: "discord：liushentong_07233",
                    instagram: "instagram：mbti536"
                },
                copyright: "© 2025 YouTube Shorts课程. 保留所有权利.",
                legal: {
                    privacy: "隐私政策",
                    terms: "服务条款",
                    cookies: "Cookie政策"
                }
            }
        }
    }
};

// 初始化i18next
i18next
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // 默认语言
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18next; 