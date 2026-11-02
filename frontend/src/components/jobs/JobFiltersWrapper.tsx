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
        job.tags.some(tag => tag.toLowerCase().includes(query)) ||
        job.stack.some(tag => tag.toLowerCase().includes(query))
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
        <div className="glass rounded-card p-12 text-center">
          <p className="text-lg font-medium text-text-primary">Nenhuma vaga encontrada</p>
          <p className="mt-2 text-body-sm text-text-secondary">
            Tente outros termos de busca ou remova os filtros.
          </p>
        </div>
      ) : (
        <div className="grid-jobs">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}