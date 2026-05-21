import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, Sparkles, HelpCircle, Layers, CheckSquare, Settings } from 'lucide-react';
import GlassSelect from './GlassSelect';

export const UniversalEnquiryModal = ({ isOpen, onClose, item = null, itemType = 'general', itemList = [] }) => {
  const { showAlert } = useAlert();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Track selected item (if opened in general mode)
  const [selectedItem, setSelectedItem] = useState(item);

  // Sync selectedItem if item prop changes
  useEffect(() => {
    setSelectedItem(item);
  }, [item]);

  // Form Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [generalRequirements, setGeneralRequirements] = useState('');

  // Service/Academic Dynamic States
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [customFieldAnswers, setCustomFieldAnswers] = useState({});

  // Default Academic Form States
  const [qualification, setQualification] = useState('');
  const [institution, setInstitution] = useState('');
  const [experience, setExperience] = useState('');
  const [includeCertification, setIncludeCertification] = useState(false);
  const [preferredIntake, setPreferredIntake] = useState('Fall 2026');

  // Extra Academic Dynamic States
  const [academicGrade, setAcademicGrade] = useState('');
  const [academicBoard, setAcademicBoard] = useState('');
  const [academicSubject, setAcademicSubject] = useState('');
  const [academicTargetUni, setAcademicTargetUni] = useState('');
  const [academicSemester, setAcademicSemester] = useState('');
  const [academicMajor, setAcademicMajor] = useState('');
  const [academicResearchField, setAcademicResearchField] = useState('');
  const [academicTopic, setAcademicTopic] = useState('');
  const [academicStatus, setAcademicStatus] = useState('Undergraduate');
  const [academicTargetJournal, setAcademicTargetJournal] = useState('');

  // Default Service Form States (when no custom form_config exists)
  const [budget, setBudget] = useState('10k-50k');
  const [timeline, setTimeline] = useState('1-3 Months');
  const [location, setLocation] = useState('');

  // Determine actual item and type
  const actualItem = useMemo(() => {
    if (itemType !== 'general') return selectedItem;
    return selectedItem; // Can be selected from list
  }, [selectedItem, itemType]);

  const actualType = useMemo(() => {
    if (itemType !== 'general') return itemType;
    if (!selectedItem) return 'general';
    return selectedItem.category_type || (selectedItem.duration ? 'academic' : 'service');
  }, [selectedItem, itemType]);

  const academicSubtype = useMemo(() => {
    if (actualType !== 'academic' || !actualItem) return 'general';
    const titleLower = String(actualItem.title || '').toLowerCase();
    const catLower = String(actualItem.category || '').toLowerCase();

    if (titleLower.includes('research') || titleLower.includes('thesis') || titleLower.includes('publication') || titleLower.includes('paper') ||
        catLower.includes('research') || catLower.includes('thesis') || catLower.includes('publication')) {
      return 'research';
    }
    if (titleLower.includes('school') || titleLower.includes('board') || titleLower.includes('junior') || titleLower.includes('grade') ||
        catLower.includes('school') || catLower.includes('board') || catLower.includes('junior') || titleLower.includes('high school')) {
      return 'school';
    }
    if (titleLower.includes('college') || titleLower.includes('university') || titleLower.includes('higher') || titleLower.includes('undergrad') || titleLower.includes('admission') ||
        catLower.includes('college') || catLower.includes('university') || catLower.includes('higher') || catLower.includes('admission') || titleLower.includes('bachelor') || titleLower.includes('master')) {
      return 'college';
    }
    return 'general';
  }, [actualItem, actualType]);

  // Auto-populate states from profile when it loads or when the modal is opened
  useEffect(() => {
    if (profile && isOpen) {
      if (profile.full_name) setName(profile.full_name);
      if (user?.email) setEmail(user.email);
      if (profile.phone) {
        const parts = profile.phone.split(' ');
        if (parts.length > 1) {
          setCountryCode(parts[0]);
          setPhone(parts.slice(1).join(' '));
        } else {
          setPhone(profile.phone);
        }
      }
      if (profile.institution) setInstitution(profile.institution);
      if (profile.major) setAcademicMajor(profile.major);
      if (profile.extra_details?.qualification) {
        setQualification(profile.extra_details.qualification);
      }
    }
  }, [profile, user, isOpen]);

  const formConfig = useMemo(() => {
    return actualItem?.extra_details?.form_config || null;
  }, [actualItem]);

  // Reset dynamic inputs when item changes
  useEffect(() => {
    if (formConfig) {
      setSelectedTier(formConfig.tiers?.[0] || '');
      setSelectedAddons([]);
      const defaults = {};
      (formConfig.custom_fields || []).forEach(f => {
        defaults[f.name] = '';
      });
      setCustomFieldAnswers(defaults);
    } else {
      setSelectedTier('');
      setSelectedAddons([]);
      setCustomFieldAnswers({});
    }
  }, [actualItem, formConfig]);

  // Calculate pricing estimates dynamically
  const pricingEstimate = useMemo(() => {
    if (!actualItem) return null;

    // Parse base price - extract the first valid sequence of digits (e.g. from range or /month text)
    const baseStr = String(actualItem.price || '');
    const cleanBaseStr = baseStr.replace(/,/g, '');
    const baseMatch = cleanBaseStr.match(/(\d+(\.\d+)?)/);
    const basePrice = baseMatch ? Math.round(parseFloat(baseMatch[0])) : 0;
    if (basePrice === 0) return null;

    // Apply tier multiplier if any
    let multiplier = 1.0;
    if (formConfig?.tierMultipliers && selectedTier) {
      multiplier = parseFloat(formConfig.tierMultipliers[selectedTier]) || 1.0;
    }

    // Add addons prices
    let addonsTotal = 0;
    if (formConfig?.addons) {
      formConfig.addons.forEach(addon => {
        if (selectedAddons.includes(addon.id)) {
          const addonPriceStr = String(addon.price || '0').replace(/,/g, '');
          const addonMatch = addonPriceStr.match(/(\d+(\.\d+)?)/);
          addonsTotal += addonMatch ? Math.round(parseFloat(addonMatch[0])) : 0;
        }
      });
    }

    // Add academic certification cost if selected
    let extraAcademicCost = 0;
    if (actualType === 'academic' && includeCertification && actualItem.extra_details?.certification_cost) {
      const certCostStr = String(actualItem.extra_details.certification_cost).replace(/,/g, '');
      const certMatch = certCostStr.match(/(\d+(\.\d+)?)/);
      extraAcademicCost = certMatch ? Math.round(parseFloat(certMatch[0])) : 0;
    }

    const estimatedTotal = Math.round(basePrice * multiplier) + addonsTotal + extraAcademicCost;
    return {
      base: basePrice,
      estimated: estimatedTotal,
      hasAddons: addonsTotal > 0,
      hasTier: selectedTier && multiplier !== 1.0,
      hasCert: extraAcademicCost > 0
    };
  }, [actualItem, actualType, formConfig, selectedTier, selectedAddons, includeCertification]);

  if (!isOpen) return null;

  // Handle addon toggles
  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const handleCustomFieldChange = (fieldName, val) => {
    setCustomFieldAnswers(prev => ({
      ...prev,
      [fieldName]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const typeLabel = actualType === 'academic' ? 'Academic Program' : 'Specialized Service';
      const titleName = actualItem?.title || actualItem?.name || 'General';
      const displayType = `[${typeLabel}] ${titleName}`;

      // Build requirement report in markdown
      let reqReport = `### ${typeLabel} Enquiry: ${titleName}\n\n`;

      const customResponses = {
        item_id: actualItem?.id,
        item_type: actualType,
        source: 'UniversalEnquiryModal'
      };

      if (formConfig) {
        if (selectedTier) {
          reqReport += `**Selected Tier:** ${selectedTier}\n`;
          customResponses.tier = selectedTier;
        }
        if (selectedAddons.length > 0) {
          const names = formConfig.addons
            .filter(a => selectedAddons.includes(a.id))
            .map(a => `${a.label} (₹${a.price})`);
          reqReport += `**Add-ons Selected:** ${names.join(', ')}\n`;
          customResponses.addons = selectedAddons;
        }

        reqReport += `\n#### Custom Configuration Answers:\n`;
        (formConfig.custom_fields || []).forEach(f => {
          const ans = customFieldAnswers[f.name] || 'N/A';
          reqReport += `* **${f.label}:** ${ans}\n`;
          customResponses[f.name] = ans;
        });
      } else if (actualType === 'academic') {
        reqReport += `**Academic Track Subtype:** ${academicSubtype.toUpperCase()}\n`;
        customResponses.academic_subtype = academicSubtype;

        if (academicSubtype === 'school') {
          reqReport += `**School Name:** ${institution || 'N/A'}\n`;
          reqReport += `**Current Grade/Class:** ${academicGrade || 'N/A'}\n`;
          reqReport += `**Board of Education:** ${academicBoard || 'N/A'}\n`;
          reqReport += `**Subject of Interest:** ${academicSubject || 'N/A'}\n`;

          customResponses.institution = institution;
          customResponses.grade = academicGrade;
          customResponses.board = academicBoard;
          customResponses.subject = academicSubject;
        } else if (academicSubtype === 'college') {
          reqReport += `**Current College/University:** ${institution || 'N/A'}\n`;
          reqReport += `**Target University:** ${academicTargetUni || 'N/A'}\n`;
          reqReport += `**Current Year/Semester:** ${academicSemester || 'N/A'}\n`;
          reqReport += `**Course / Major:** ${academicMajor || 'N/A'}\n`;

          customResponses.institution = institution;
          customResponses.target_university = academicTargetUni;
          customResponses.semester = academicSemester;
          customResponses.major = academicMajor;
        } else if (academicSubtype === 'research') {
          reqReport += `**Institution / Affiliation:** ${institution || 'N/A'}\n`;
          reqReport += `**Research Field / Interest:** ${academicResearchField || 'N/A'}\n`;
          reqReport += `**Proposed Topic:** ${academicTopic || 'N/A'}\n`;
          reqReport += `**Academic Status:** ${academicStatus || 'N/A'}\n`;
          reqReport += `**Target Journal/Conference:** ${academicTargetJournal || 'N/A'}\n`;

          customResponses.institution = institution;
          customResponses.research_field = academicResearchField;
          customResponses.proposed_topic = academicTopic;
          customResponses.academic_status = academicStatus;
          customResponses.target_journal = academicTargetJournal;
        } else {
          // General / Default
          reqReport += `**Highest Qualification:** ${qualification || 'N/A'}\n`;
          reqReport += `**Institution:** ${institution || 'N/A'}\n`;
          reqReport += `**Years of Experience:** ${experience || 'N/A'}\n`;

          customResponses.qualification = qualification;
          customResponses.institution = institution;
          customResponses.experience = experience;
        }

        // Intake Preference and Certification are general for all academic subtypes
        reqReport += `**Intake preference:** ${preferredIntake}\n`;
        reqReport += `**Include Certification:** ${includeCertification ? 'Yes' : 'No'}\n`;
        customResponses.preferred_intake = preferredIntake;
        customResponses.include_certification = includeCertification;
      } else if (actualType === 'service') {
        reqReport += `**Estimated Budget:** ${budget}\n`;
        reqReport += `**Timeline Expectation:** ${timeline}\n`;
        reqReport += `**Client Location:** ${location || 'N/A'}\n`;

        customResponses.budget = budget;
        customResponses.timeline = timeline;
        customResponses.location = location;
      }

      if (pricingEstimate) {
        reqReport += `\n**Estimated Estimate Quote:** ₹${pricingEstimate.estimated.toLocaleString('en-IN')}\n`;
        customResponses.estimated_quote = pricingEstimate.estimated;
      }

      if (generalRequirements) {
        reqReport += `\n**Client Remarks & Special Instructions:**\n${generalRequirements}\n`;
      }

      const payload = {
        name: name,
        email: email,
        phone: `${countryCode} ${phone}`,
        location: location || customResponses.location || '',
        service_type: displayType,
        tier: selectedTier || '',
        budget: budget || '',
        timeline: timeline || '',
        status: 'enquiry',
        created_at: new Date().toISOString(),
        requirements: reqReport,
        custom_responses: customResponses
      };

      const { error } = await supabase.from('service_inquiries').insert([payload]);
      if (error) throw error;

      // Save data to user profile if logged in
      if (user?.id) {
        try {
          const { data: profData, error: fetchErr } = await supabase
            .from('profiles')
            .select('institution, major, education, extra_details')
            .eq('id', user.id)
            .single();

          if (!fetchErr) {
            let updatedEducation = Array.isArray(profData?.education) ? [...profData.education] : [];

            // Determine school/institution and degree/qualification/grade to store
            const schoolName = institution || profData?.institution || '';
            let degreeName = 'Academic Track';

            if (academicSubtype === 'school') {
              degreeName = `${academicGrade} Grade (${academicBoard})`;
            } else if (academicSubtype === 'college') {
              degreeName = academicMajor || 'College Program';
            } else if (academicSubtype === 'research') {
              degreeName = `Research: ${academicResearchField}`;
            } else {
              degreeName = qualification || 'Academic Program';
            }

            if (schoolName) {
              const alreadyExists = updatedEducation.some(
                edu => String(edu.school).toLowerCase() === schoolName.toLowerCase() && 
                       String(edu.degree).toLowerCase() === degreeName.toLowerCase()
              );
              if (!alreadyExists) {
                updatedEducation.push({
                  school: schoolName,
                  degree: degreeName,
                  year: new Date().getFullYear().toString()
                });
              }
            }

            const updatedExtra = {
              ...(profData?.extra_details || {}),
              academic_subtype: academicSubtype,
              qualification: qualification || profData?.extra_details?.qualification || '',
              preferred_intake: preferredIntake || profData?.extra_details?.preferred_intake || ''
            };

            const profileUpdates = {
              institution: schoolName || null,
              major: (academicSubtype === 'college' ? academicMajor : null) || profData?.major || null,
              education: updatedEducation,
              extra_details: updatedExtra
            };

            await supabase
              .from('profiles')
              .update(profileUpdates)
              .eq('id', user.id);
          }
        } catch (profileErr) {
          console.error('Error auto-updating user profile with academic details:', profileErr);
        }
      }

      // Trigger server-less email notification to admin & user
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'universal_enquiry',
            email: email,
            name: name,
            service_name: displayType,
            phone: `${countryCode} ${phone}`,
            message: reqReport,
            origin: window.location.origin,
          }),
        });
      } catch (emailErr) {
        console.error('Email alert service returned status (enquiry still stored):', emailErr);
      }

      setSubmitted(true);
      showAlert('Your interest has been logged. We will contact you soon.', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Could not log your inquiry. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-lenis-prevent="true"
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl overflow-y-auto w-full h-full custom-scrollbar"
      >
        <div className="relative w-full min-h-screen max-w-4xl mx-auto flex flex-col justify-start pt-24 pb-24 px-6">
          {/* Close button */}
          <button
            onClick={() => { onClose(); setSubmitted(false); }}
            className="fixed top-8 right-8 p-4 bg-white/5 hover:bg-destructive shadow-xl hover:text-destructive-foreground rounded-full transition-all border border-white/10 z-[110]"
          >
            <X size={24} />
          </button>

          <div className="relative z-10 w-full bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-black/10 dark:border-white/10 p-8 md:p-14 shadow-2xl overflow-hidden">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
                <CheckCircle2 size={64} className="text-green-500 animate-bounce" />
                <h2 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">
                  Enquiry <span className="text-primary">Registered</span>
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
                  We have received your request for <strong>{actualItem?.title || actualItem?.name}</strong>. A consultant from 5EVEN will review your details and connect with you shortly.
                </p>
                <button
                  onClick={() => { onClose(); setSubmitted(false); }}
                  className="mt-6 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <div className="mb-10 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-primary animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                      {actualType === 'academic' ? 'Academic Admission Workflow' : actualType === 'service' ? 'Enterprise Service Solutions' : 'General Enquiry Platform'}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white italic">
                    Request <span className="text-primary">Details</span>
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Please provide your contact profile along with the dynamic specifications of your selected track.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">

                  {/* Basic User Information */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground/50 border-b border-border pb-2">
                      1. Applicant Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your name"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. john@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-4 md:col-span-1">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-primary">Code</label>
                          <input
                            type="text"
                            required
                            placeholder="+91"
                            value={countryCode}
                            onChange={e => setCountryCode(e.target.value)}
                            className="w-full px-4 py-4 text-center rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                          />
                        </div>
                        <div className="col-span-3 space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-primary">Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 9876543210"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {itemType === 'general' && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-primary">Program of Interest</label>
                          <GlassSelect
                            value={selectedItem ? JSON.stringify(selectedItem) : ''}
                            onChange={(val) => {
                              try {
                                setSelectedItem(val ? JSON.parse(val) : null);
                              } catch (e) {
                                setSelectedItem(null);
                              }
                            }}
                            placeholder="Select program/service..."
                            options={itemList.map(item => ({
                              value: JSON.stringify(item),
                              label: `[${item.duration ? 'Academic' : 'Service'}] ${item.title || item.name}`
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Custom Configuration / Form Config */}
                  {actualItem && (
                    <div className="space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-widest text-foreground/50 border-b border-border pb-2">
                        2. Track Specifications: {actualItem.title || actualItem.name}
                      </h3>

                      {formConfig ? (
                        <div className="space-y-8">

                          {/* Tiers Section */}
                          {formConfig.tiers && formConfig.tiers.length > 0 && (
                            <div className="space-y-3">
                              <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <Layers size={14} /> Choose Tier Level
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {formConfig.tiers.map((tier) => {
                                  const multiplier = parseFloat(formConfig.tierMultipliers?.[tier]) || 1.0;
                                  const isSelected = selectedTier === tier;
                                  return (
                                    <div
                                      key={tier}
                                      onClick={() => setSelectedTier(tier)}
                                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[100px] select-none ${isSelected
                                          ? 'border-primary bg-primary/10 shadow-lg'
                                          : 'border-border bg-background/30 hover:border-primary/50'
                                        }`}
                                    >
                                      <div>
                                        <p className="font-black text-sm uppercase tracking-wider text-foreground">{tier}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium mt-1">
                                          {multiplier === 1.0 ? 'Standard pricing index' : `${multiplier}x pricing index`}
                                        </p>
                                      </div>
                                      <div className="flex items-center justify-end mt-4">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Add-ons Section */}
                          {formConfig.addons && formConfig.addons.length > 0 && (
                            <div className="space-y-3">
                              <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <CheckSquare size={14} /> Optional Custom Add-ons
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {formConfig.addons.map((addon) => {
                                  const isSelected = selectedAddons.includes(addon.id);
                                  return (
                                    <div
                                      key={addon.id}
                                      onClick={() => handleAddonToggle(addon.id)}
                                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${isSelected
                                          ? 'border-primary bg-primary/10'
                                          : 'border-border bg-background/30 hover:border-primary/50'
                                        }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
                                          {isSelected && <span className="text-[10px]">✓</span>}
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-foreground">{addon.label}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-black text-primary">+ ₹{addon.price.toLocaleString('en-IN')}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Custom Fields Inputs */}
                          {formConfig.custom_fields && formConfig.custom_fields.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {formConfig.custom_fields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                  <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                                    {field.label} {field.required && <span className="text-destructive">*</span>}
                                  </label>
                                  <input
                                    type={field.type || 'text'}
                                    required={field.required}
                                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                    value={customFieldAnswers[field.name] || ''}
                                    onChange={e => handleCustomFieldChange(field.name, e.target.value)}
                                    className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none transition-colors"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      ) : (
                        /* Default Forms when no custom form_config is configured */
                        <div className="space-y-6">
                          {actualType === 'academic' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {academicSubtype === 'school' && (
                                <>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">School Name</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. KV School / Delhi Public School"
                                      value={institution}
                                      onChange={e => setInstitution(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Current Grade / Class</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Grade 10 / Grade 12"
                                      value={academicGrade}
                                      onChange={e => setAcademicGrade(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Board of Education</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. CBSE / ICSE / IB / State Board"
                                      value={academicBoard}
                                      onChange={e => setAcademicBoard(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Subject of Interest</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Mathematics / Physics / Science"
                                      value={academicSubject}
                                      onChange={e => setAcademicSubject(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                </>
                              )}

                              {academicSubtype === 'college' && (
                                <>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Current College / University</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. IIT Bombay / University of Mumbai"
                                      value={institution}
                                      onChange={e => setInstitution(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Target Institution / University</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Harvard GSD / MIT Architecture"
                                      value={academicTargetUni}
                                      onChange={e => setAcademicTargetUni(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Current Semester / Year</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Semester 5 / Year 3"
                                      value={academicSemester}
                                      onChange={e => setAcademicSemester(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Course / Major of Study</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. B.Arch / B.Tech Computer Science"
                                      value={academicMajor}
                                      onChange={e => setAcademicMajor(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                </>
                              )}

                              {academicSubtype === 'research' && (
                                <>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Institution / Affiliation</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. IISc Bangalore / CEPT University"
                                      value={institution}
                                      onChange={e => setInstitution(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Research Field / Area of Interest</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Sustainable Urbanism / Computational Design"
                                      value={academicResearchField}
                                      onChange={e => setAcademicResearchField(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Proposed Topic / Title (Optional)</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. AI-driven facade daylighting optimization"
                                      value={academicTopic}
                                      onChange={e => setAcademicTopic(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Current Academic Status</label>
                                    <GlassSelect
                                      value={academicStatus}
                                      onChange={setAcademicStatus}
                                      options={[
                                        { value: 'Undergraduate', label: 'Undergraduate Student' },
                                        { value: 'Postgraduate', label: 'Postgraduate (Master\'s)' },
                                        { value: 'PhD Candidate', label: 'PhD Candidate / Scholar' },
                                        { value: 'Faculty / Researcher', label: 'Faculty / Researcher' }
                                      ]}
                                    />
                                  </div>
                                  <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Target Journal / Conference (Optional)</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Scopus Indexed Journal / IEEE / CAADRIA"
                                      value={academicTargetJournal}
                                      onChange={e => setAcademicTargetJournal(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                </>
                              )}

                              {academicSubtype === 'general' && (
                                <>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Highest Academic Qualification</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Master's in Architecture / Grade 12"
                                      value={qualification}
                                      onChange={e => setQualification(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Prior School / Institution Name</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. IIT Bombay / KV School"
                                      value={institution}
                                      onChange={e => setInstitution(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                  <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Years of Work Experience</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 2 years (optional)"
                                      value={experience}
                                      onChange={e => setExperience(e.target.value)}
                                      className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                    />
                                  </div>
                                </>
                              )}

                              <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-primary">Preferred Intake</label>
                                <GlassSelect
                                  value={preferredIntake}
                                  onChange={setPreferredIntake}
                                  options={[
                                    { value: 'Summer 2026', label: 'Summer 2026 (Intake A)' },
                                    { value: 'Fall 2026', label: 'Fall 2026 (Intake B)' },
                                    { value: 'Winter 2027', label: 'Winter 2027 (Intake C)' }
                                  ]}
                                />
                              </div>

                              {actualItem.extra_details?.certification_available && (
                                <div className="md:col-span-2 pt-2 flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    id="enrollCert"
                                    checked={includeCertification}
                                    onChange={e => setIncludeCertification(e.target.checked)}
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary"
                                  />
                                  <label htmlFor="enrollCert" className="text-xs font-bold uppercase tracking-widest text-foreground select-none cursor-pointer">
                                    Include Official Certificate (+ {actualItem.extra_details.certification_cost || 'No cost'})
                                  </label>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-primary">Estimated Budget</label>
                                <GlassSelect
                                  value={budget}
                                  onChange={setBudget}
                                  options={[
                                    { value: '< ₹25,000', label: 'Under ₹25,000' },
                                    { value: '₹25,000 - ₹1,00,000', label: '₹25,000 - ₹1,00,000' },
                                    { value: '₹1,00,000 - ₹3,00,000', label: '₹1,00,000 - ₹3,00,000' },
                                    { value: '₹3,00,000+', label: '₹3,00,000+' }
                                  ]}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-primary">Timeline Expectation</label>
                                <GlassSelect
                                  value={timeline}
                                  onChange={setTimeline}
                                  options={[
                                    { value: 'Express (1-2 weeks)', label: 'Express (1-2 weeks)' },
                                    { value: 'Standard (1-3 months)', label: 'Standard (1-3 months)' },
                                    { value: 'Long Term (3+ months)', label: 'Long Term (3+ months)' }
                                  ]}
                                />
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-primary">Company / Client Location</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Mumbai, India / London, UK"
                                  value={location}
                                  onChange={e => setLocation(e.target.value)}
                                  className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing / Details Panel summary */}
                  {pricingEstimate && (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 rounded-3xl border border-primary/20 bg-primary/5 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                          <Settings size={12} className="animate-spin" /> Pricing Estimator
                        </span>
                        <p className="text-xs text-muted-foreground font-medium">
                          Based on chosen configurations, including taxes and options.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Estimated Total Quote</p>
                        <p className="text-3xl font-black text-foreground">₹{pricingEstimate.estimated.toLocaleString('en-IN')}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Requirements / Remarks */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground/50 border-b border-border pb-2">
                      3. Requirements & Notes
                    </h3>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary">
                        {actualType === 'academic' ? 'Statement of Intent / Learning Goals' : 'Detail your requirement specifications'}
                      </label>
                      <textarea
                        rows="4"
                        value={generalRequirements}
                        onChange={e => setGeneralRequirements(e.target.value)}
                        placeholder={actualType === 'academic' ? "What do you hope to achieve through this track?" : "Describe details, integrations or special options needed..."}
                        className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border focus:border-primary outline-none resize-none font-bold text-sm"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    <span>{loading ? 'Sending Request...' : 'Submit Enquiry'}</span>
                  </button>

                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UniversalEnquiryModal;
