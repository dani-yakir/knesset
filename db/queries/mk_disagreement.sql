select vote.id as vote_id, vote."date" as "date", law_item.title as title, vote_detail.mk_name, vote_result_type.name as choice from (select id_ from (select vote.id as id_ from vote join vote_detail on vote_detail."voteId" = vote.id
where vote_detail.mk_name like '%נתניהו%' or vote_detail.mk_name like '%אדלשטיין%'
GROUP BY vote.id
HAVING COUNT(*) = 2)
join vote_detail on vote_detail."voteId" = id_
where vote_detail.mk_name like '%נתניהו%' or vote_detail.mk_name like '%אדלשטיין%'
group by id_
having count(distinct vote_detail."voteResultTypeId") > 1)
join vote on vote.id = id_
join law_item on vote."lawItemId" = law_item.id
join vote_detail on vote_detail."voteId" = vote.id
join vote_result_type on vote_detail."voteResultTypeId" = vote_result_type.id
where vote_detail.mk_name like '%אדלשטיין%' or vote_detail.mk_name like '%נתניהו%'
ORDER BY vote_id, mk_name