'use client';

import { useState } from 'react';
import { JobFilters } from './JobFilters';
import { JobCard } from './JobCard';
import type { JobFilters as JobFiltersType, Job } from '@/types';

interface JobFiltersWrapperProps {
  initialJobs: Job[];
}

export function JobFiltersWrapper({ initialJobs }: JobFiltersWrapperProps) {
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
    
    let filtered = initialJobs;
    
    if (newFilters.contract_type) {
      filtered = filtered.filter(job => job.contract_type === newFilters.contract_type);
    }
    if (newFilters.experience_level) {
      filtered = filtered.filter(job => job.experience_level === newFilters.experience_level);
    }
    if (newFilters.query) {
      const query = newFilters.query.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredJobs(filtered);
  };

  return (
    <div className="mt-8">
      <JobFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {filteredJobs.length === 0 ? (
        <div className="glass rounded-app-card p-12 text-center">
          <p className="text-lg font-medium">Nenhuma vaga encontrada</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Tente outros termos de busca ou remova os filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}